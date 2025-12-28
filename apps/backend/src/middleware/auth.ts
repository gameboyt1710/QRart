import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

/**
 * API Key Authentication Middleware
 * 
 * For MVP, we use simple API key authentication via the x-api-key header.
 * The key is validated against either:
 * 1. The API_KEYS environment variable (comma-separated list)
 * 2. The ApiKey table in the database
 * 
 * In production, consider:
 * - Hashing API keys (never store plaintext)
 * - Adding scopes/permissions per key
 * - Rate limiting per key
 * - API key rotation
 * - OAuth2/JWT for user authentication
 */

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

/**
 * Validates the x-api-key header
 * Returns 401 if missing, 403 if invalid
 */
export async function requireApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || typeof apiKey !== 'string') {
    res.status(401).json({
      error: 'unauthorized',
      message: 'Missing x-api-key header',
    });
    return;
  }

  // Check against environment variable first (fast path for dev)
  const envKeys = process.env.API_KEYS?.split(',').map(k => k.trim()) || [];
  if (envKeys.includes(apiKey)) {
    req.apiKey = apiKey;
    next();
    return;
  }

  // Check against database
  try {
    const dbKey = await prisma.apiKey.findUnique({
      where: { key: apiKey },
    });

    if (dbKey && dbKey.active) {
      req.apiKey = apiKey;
      next();
      return;
    }
  } catch (error) {
    console.error('Error validating API key:', error);
  }

  res.status(403).json({
    error: 'forbidden',
    message: 'Invalid API key',
  });
}

/**
 * Optional API key validation - doesn't fail if missing
 * Useful for endpoints that behave differently based on auth status
 */
export async function optionalApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiKey = req.headers['x-api-key'];

  if (apiKey && typeof apiKey === 'string') {
    const envKeys = process.env.API_KEYS?.split(',').map(k => k.trim()) || [];
    if (envKeys.includes(apiKey)) {
      req.apiKey = apiKey;
    } else {
      try {
        const dbKey = await prisma.apiKey.findUnique({
          where: { key: apiKey },
        });
        if (dbKey && dbKey.active) {
          req.apiKey = apiKey;
        }
      } catch (error) {
        console.error('Error validating API key:', error);
      }
    }
  }

  next();
}
