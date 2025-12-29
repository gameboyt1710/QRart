import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

console.log('Starting QRart...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ set' : '✗ not set');
console.log('PORT:', PORT);

// Ensure table exists
async function ensureTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Artwork" (
        "id" TEXT NOT NULL,
        "imageData" BYTEA NOT NULL,
        "mimeType" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Artwork_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Table ready');
  } catch (error) {
    console.error('Table creation warning:', (error as Error).message);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type'));
    }
  },
});

// =====================
// Upload Page
// =====================
app.get('/', (_req, res) => {
  res.type('text/html').send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QRart - Upload Artwork</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0a;
      color: #e0e0e0;
      font-family: system-ui, sans-serif;
      padding: 2rem;
    }
    .container { max-width: 500px; margin: 0 auto; }
    h1 { color: #8b5cf6; margin-bottom: 0.5rem; }
    .subtitle { color: #888; margin-bottom: 2rem; }
    .card {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 1rem;
    }
    input, button { 
      width: 100%; 
      padding: 0.75rem; 
      margin-bottom: 1rem; 
      border: 1px solid #333; 
      border-radius: 4px; 
      background: #0a0a0a; 
      color: #e0e0e0; 
      font-size: 1rem; 
    }
    button { 
      background: #8b5cf6; 
      border: none; 
      cursor: pointer; 
      font-weight: 600; 
    }
    button:hover { background: #7c3aed; }
    .result { background: #1a2910; border: 1px solid #2d4a1c; padding: 1rem; border-radius: 4px; margin-top: 1rem; display: none; }
    .result.show { display: block; }
    .qr-code { font-family: monospace; font-size: 1.1rem; color: #4ade80; background: #0a0a0a; padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0; word-break: break-all; }
    .error { background: #2a1010; border: 1px solid #4a1c1c; color: #f87171; }
    img { max-width: 100%; border-radius: 4px; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 QRart</h1>
    <p class="subtitle">Upload → Get QR → Post on Twitter</p>

    <div class="card">
      <input type="file" id="imageFile" accept="image/*" />
      <img id="preview" style="display: none;" />
      <button onclick="upload()">Upload</button>

      <div id="result" class="result">
        <h3>✨ Success!</h3>
        <p>Your QR code:</p>
        <img id="qrCode" style="width: 300px; height: 300px; border: 2px solid #4ade80; border-radius: 8px;" />
        <button onclick="downloadQR()">Download QR</button>
      </div>

      <div id="error" class="result error" style="display: none;">
        <p id="errorMsg"></p>
      </div>
    </div>
  </div>

  <script>
    const fileInput = document.getElementById('imageFile');
    const preview = document.getElementById('preview');

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    async function upload() {
      const file = fileInput.files[0];
      if (!file) {
        showError('Select an image');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await fetch('/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();
        const qrImg = document.getElementById('qrCode') as HTMLImageElement;
        qrImg.src = 'data:image/png;base64,' + data.qrCode;
        document.getElementById('result').classList.add('show');
        document.getElementById('error').style.display = 'none';
      } catch (err) {
        showError((err as Error).message);
      }
    }

    function showError(msg) {
      document.getElementById('errorMsg').textContent = msg;
      document.getElementById('error').style.display = 'block';
      document.getElementById('result').classList.remove('show');
    }

    function downloadQR() {
      const qrImg = document.getElementById('qrCode') as HTMLImageElement;
      const link = document.createElement('a');
      link.href = qrImg.src;
      link.download = 'qrart.png';
      link.click();
    }
  </script>
</body>
</html>
  `);
});

// =====================
// Upload Endpoint
// =====================
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('Uploading image:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    const id = nanoid(8);
    const artwork = await prisma.artwork.create({
      data: {
        id,
        imageData: req.file.buffer,
        mimeType: req.file.mimetype,
      },
    });

    // Generate QR code PNG encoding just the ID
    const qrPng = await QRCode.toBuffer(id, { width: 300 });

    console.log('Created artwork:', id);
    res.json({ id, qrCode: qrPng.toString('base64') });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// =====================
// Get Image Endpoint
// =====================
app.get('/image/:id', async (req, res) => {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: req.params.id },
    });

    if (!artwork) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.type(artwork.mimeType);
    res.send(artwork.imageData);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// =====================
// Health Check
// =====================
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// =====================
// Start Server
// =====================
async function start() {
  await ensureTable();
  
  app.listen(PORT, () => {
    console.log(`
🎨 QRart Server
================
🚀 http://localhost:${PORT}
📤 Upload: POST /upload
🖼️  Image: GET /image/:id
❤️  Health: GET /health
    `);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
