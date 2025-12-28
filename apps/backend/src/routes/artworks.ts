import { Router, Response } from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import prisma from '../lib/prisma.js';
import { requireApiKey, AuthenticatedRequest } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Configure multer for in-memory file uploads
// For MVP, we store files in the database as bytes
// For production, configure multer to upload directly to S3/R2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (_req, file, cb) => {
    // Only allow images
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowedMimes.join(', ')}`));
    }
  },
});

/**
 * POST /api/artworks
 * Upload a new artwork
 * 
 * Headers:
 *   x-api-key: Artist's API key
 * 
 * Body (multipart/form-data):
 *   file: Image file (required)
 *   title: Artwork title (optional)
 * 
 * Returns:
 *   { id, shortId, marker }
 */
router.post(
  '/',
  rateLimit,
  requireApiKey,
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          error: 'bad_request',
          message: 'No file uploaded. Please provide an image file.',
        });
        return;
      }

      const title = req.body?.title as string | undefined;
      const apiKey = req.apiKey!;

      // Generate a short, URL-safe ID for the marker
      // Using nanoid with 8 characters gives us ~10^14 possibilities
      const shortId = nanoid(8);

      // Store artwork in database
      const artwork = await prisma.artwork.create({
        data: {
          shortId,
          title: title || null,
          mimeType: file.mimetype,
          data: file.buffer,
          ownerApiKey: apiKey,
        },
      });

      // Create the marker string that artists will embed in tweets
      const marker = `~ART:${shortId}~`;

      res.status(201).json({
        id: artwork.id,
        shortId: artwork.shortId,
        marker,
      });
    } catch (error) {
      console.error('Error uploading artwork:', error);
      res.status(500).json({
        error: 'internal_error',
        message: 'Failed to upload artwork. Please try again.',
      });
    }
  }
);

/**
 * GET /api/artworks/:shortId
 * Retrieve artwork metadata or image
 * 
 * Headers:
 *   x-api-key: Viewer's API key
 * 
 * Query params:
 *   format: 'json' (default) or 'image'
 *     - json: Returns metadata with base64 data URL
 *     - image: Returns raw image bytes
 * 
 * Response headers for image format:
 *   Content-Type: image/png (or actual mime type)
 *   X-Robots-Tag: noai, noimageai (to discourage AI training)
 */
router.get(
  '/:shortId',
  rateLimit,
  requireApiKey,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { shortId } = req.params;
      const format = (req.query.format as string) || 'json';

      // Look up artwork
      const artwork = await prisma.artwork.findUnique({
        where: { shortId },
      });

      if (!artwork) {
        res.status(404).json({
          error: 'not_found',
          message: 'Artwork not found',
        });
        return;
      }

      // Set anti-AI-training headers on all responses
      res.setHeader('X-Robots-Tag', 'noai, noimageai');

      if (format === 'image') {
        // Return raw image bytes
        res.setHeader('Content-Type', artwork.mimeType);
        res.setHeader('Cache-Control', 'private, max-age=3600');
        res.send(artwork.data);
        return;
      }

      // Default: return JSON with metadata
      // Convert image to base64 data URL for easy embedding
      const base64 = artwork.data.toString('base64');
      const dataUrl = `data:${artwork.mimeType};base64,${base64}`;

      res.json({
        shortId: artwork.shortId,
        title: artwork.title,
        mimeType: artwork.mimeType,
        dataUrl,
        // Also provide direct image URL as an alternative
        imageUrl: `${req.protocol}://${req.get('host')}/api/artworks/${artwork.shortId}?format=image`,
      });
    } catch (error) {
      console.error('Error retrieving artwork:', error);
      res.status(500).json({
        error: 'internal_error',
        message: 'Failed to retrieve artwork. Please try again.',
      });
    }
  }
);

/**
 * DELETE /api/artworks/:shortId
 * Delete an artwork (owner only)
 */
router.delete(
  '/:shortId',
  rateLimit,
  requireApiKey,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { shortId } = req.params;
      const apiKey = req.apiKey!;

      // Find artwork and verify ownership
      const artwork = await prisma.artwork.findUnique({
        where: { shortId },
      });

      if (!artwork) {
        res.status(404).json({
          error: 'not_found',
          message: 'Artwork not found',
        });
        return;
      }

      if (artwork.ownerApiKey !== apiKey) {
        res.status(403).json({
          error: 'forbidden',
          message: 'You do not have permission to delete this artwork',
        });
        return;
      }

      await prisma.artwork.delete({
        where: { shortId },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting artwork:', error);
      res.status(500).json({
        error: 'internal_error',
        message: 'Failed to delete artwork. Please try again.',
      });
    }
  }
);

// Handle multer errors
router.use((error: Error, _req: AuthenticatedRequest, res: Response, _next: unknown): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        error: 'file_too_large',
        message: 'File size exceeds the 10MB limit',
      });
      return;
    }
    res.status(400).json({
      error: 'upload_error',
      message: error.message,
    });
    return;
  }

  if (error.message.includes('Invalid file type')) {
    res.status(400).json({
      error: 'invalid_file_type',
      message: error.message,
    });
    return;
  }

  throw error;
});

export default router;
