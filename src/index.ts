import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import artworksRouter from './routes/artworks.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ===========================================
// CORS Configuration
// ===========================================
// For MVP, we allow all origins but log a warning
// In production, restrict to your web UI and extension origins
const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || ['*'];

app.use(cors({
  origin: corsOrigins.includes('*') ? true : corsOrigins,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
  credentials: true,
}));

if (corsOrigins.includes('*')) {
  console.warn('⚠️  CORS is configured to allow all origins. Restrict this in production!');
}

// ===========================================
// Middleware
// ===========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================================
// Health Check
// ===========================================
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===========================================
// robots.txt - Discourage AI Training
// ===========================================
/**
 * This robots.txt is designed to discourage automated scraping
 * and AI training on the artwork content.
 * 
 * Note: This is a legal/policy signal, not technical enforcement.
 * Malicious actors can still scrape, but having this in place:
 * 1. Establishes clear terms
 * 2. Provides legal grounds for action
 * 3. May discourage ethical scrapers and AI companies
 */
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send(`# QRart Platform - Encoded Art Viewer
# 
# NOTICE: All artwork served through this platform is protected.
# Automated scraping, AI training, and dataset creation are PROHIBITED.
# By accessing this service, you agree to these terms.
# See /terms for full terms of service.

User-agent: *
Disallow: /api/artworks

# Specific AI/ML crawler blocks
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

# Common crawlers that may be used for training data
User-agent: Amazonbot
Disallow: /

User-agent: FacebookBot
Disallow: /
`);
});

// ===========================================
// Terms of Service
// ===========================================
app.get('/terms', (_req, res) => {
  res.type('text/html');
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - QRart Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #111; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
    h2 { color: #444; margin-top: 2rem; }
    .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
    .prohibited { background: #f8d7da; border: 1px solid #dc3545; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
    ul { margin-left: 1.5rem; }
    li { margin: 0.5rem 0; }
  </style>
</head>
<body>
  <h1>QRart Platform - Terms of Service</h1>
  
  <div class="warning">
    <strong>⚠️ Important:</strong> By accessing any content on this platform, 
    you agree to be bound by these terms.
  </div>

  <h2>1. Purpose</h2>
  <p>
    QRart is a platform that allows artists to share their artwork through 
    encoded markers while maintaining control over distribution and usage rights.
  </p>

  <h2>2. Prohibited Uses</h2>
  <div class="prohibited">
    <p><strong>The following activities are strictly prohibited:</strong></p>
    <ul>
      <li><strong>AI Training:</strong> Using any artwork to train, fine-tune, or develop 
          machine learning models, including but not limited to image generation models, 
          classifiers, or embedding models.</li>
      <li><strong>Dataset Creation:</strong> Including artwork in any dataset, corpus, 
          or collection intended for machine learning or AI research.</li>
      <li><strong>Automated Scraping:</strong> Using automated tools, bots, or scripts 
          to bulk download or collect artwork.</li>
      <li><strong>Redistribution:</strong> Sharing, reselling, or redistributing artwork 
          without explicit permission from the artist.</li>
      <li><strong>Commercial Use:</strong> Using artwork for commercial purposes without 
          licensing agreement with the artist.</li>
    </ul>
  </div>

  <h2>3. Authorized Use</h2>
  <p>Valid API key holders may:</p>
  <ul>
    <li>View artwork through the official browser extension</li>
    <li>Display artwork for personal, non-commercial purposes</li>
    <li>Share the marker text (not the artwork itself) to direct others to view the art</li>
  </ul>

  <h2>4. Artist Rights</h2>
  <p>
    All artwork remains the intellectual property of the respective artists. 
    Artists retain full copyright and control over their work. This platform 
    serves only as a distribution mechanism under the artist's terms.
  </p>

  <h2>5. Enforcement</h2>
  <p>
    Violation of these terms may result in:
  </p>
  <ul>
    <li>Immediate revocation of API access</li>
    <li>Legal action for damages</li>
    <li>Reporting to relevant authorities</li>
  </ul>

  <h2>6. Technical Measures</h2>
  <p>
    We implement technical measures including rate limiting, API authentication, 
    and logging to enforce these terms. All access is logged and may be audited.
  </p>

  <h2>7. Contact</h2>
  <p>
    For licensing inquiries or to report violations, please contact the platform administrator.
  </p>

  <p style="margin-top: 3rem; color: #666; font-size: 0.9rem;">
    Last updated: ${new Date().toISOString().split('T')[0]}
  </p>
</body>
</html>
  `);
});

// ===========================================
// API Routes
// ===========================================
app.use('/api/artworks', artworksRouter);

// ===========================================
// Simple upload page (root)
// ===========================================
app.get('/', (_req, res) => {
  res.type('text/html');
  res.send(`
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 2rem;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      color: #8b5cf6;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: #888;
      margin-bottom: 2rem;
    }
    .card {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 1.5rem;
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
    button:disabled {
      background: #333;
      cursor: not-allowed;
    }
    .result {
      background: #1a2910;
      border: 1px solid #2d4a1c;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      display: none;
    }
    .result.show { display: block; }
    .marker {
      font-family: monospace;
      font-size: 1.1rem;
      color: #4ade80;
      background: #0a0a0a;
      padding: 0.5rem;
      border-radius: 4px;
      margin: 0.5rem 0;
      word-break: break-all;
    }
    .instructions {
      color: #888;
      font-size: 0.9rem;
    }
    .instructions ol {
      margin-left: 1.5rem;
      margin-top: 0.5rem;
    }
    .error {
      background: #2a1010;
      border: 1px solid #4a1c1c;
      color: #f87171;
    }
    #preview {
      max-width: 100%;
      border-radius: 4px;
      margin-top: 1rem;
      display: none;
    }
    #preview.show { display: block; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 QRart</h1>
    <p class="subtitle">Upload artwork → Get a marker → Post on X/Twitter</p>

    <div class="card">
      <input type="text" id="apiKey" placeholder="Your API Key" />
      <input type="file" id="imageFile" accept="image/*" />
      <img id="preview" alt="Preview" />
      <button id="uploadBtn" onclick="upload()">Upload Artwork</button>

      <div id="result" class="result">
        <h3>✨ Artwork uploaded!</h3>
        <p>Your marker:</p>
        <div class="marker" id="marker"></div>
        <button onclick="copyMarker()">Copy Marker</button>
      </div>

      <div id="error" class="result error">
        <p id="errorMsg"></p>
      </div>
    </div>

    <div class="card instructions">
      <h3>How it works</h3>
      <ol>
        <li>Upload your artwork</li>
        <li>Copy the marker (e.g., ~ART:abc123~)</li>
        <li>Post the marker in a tweet</li>
        <li>Users with the browser extension see your artwork!</li>
      </ol>
    </div>
  </div>

  <script>
    const preview = document.getElementById('preview');
    const fileInput = document.getElementById('imageFile');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const markerDiv = document.getElementById('marker');
    const errorMsg = document.getElementById('errorMsg');

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          preview.classList.add('show');
        };
        reader.readAsDataURL(file);
      }
    });

    async function upload() {
      const apiKey = document.getElementById('apiKey').value;
      const file = fileInput.files[0];

      if (!apiKey || !file) {
        showError('Please enter API key and select an image');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await fetch('/api/artworks', {
          method: 'POST',
          headers: { 'x-api-key': apiKey },
          body: formData
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Upload failed');
        }

        const data = await res.json();
        markerDiv.textContent = data.marker;
        resultDiv.classList.add('show');
        errorDiv.classList.remove('show');
      } catch (err) {
        showError(err.message);
      }
    }

    function showError(msg) {
      errorMsg.textContent = msg;
      errorDiv.classList.add('show');
      resultDiv.classList.remove('show');
    }

    function copyMarker() {
      navigator.clipboard.writeText(markerDiv.textContent);
      alert('Marker copied to clipboard!');
    }
  </script>
</body>
</html>
  `);
});

// ===========================================
// Error Handler
// ===========================================
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'internal_error',
    message: 'An unexpected error occurred',
  });
});

// ===========================================
// Start Server
// ===========================================
app.listen(PORT, () => {
  console.log(`
🎨 QRart Backend Server
========================
🚀 Server running on http://localhost:${PORT}
📚 API Docs: http://localhost:${PORT}/terms
🤖 robots.txt: http://localhost:${PORT}/robots.txt
❤️  Health check: http://localhost:${PORT}/health

Endpoints:
  POST   /api/artworks           - Upload artwork
  GET    /api/artworks/:shortId  - Get artwork (json or image)
  DELETE /api/artworks/:shortId  - Delete artwork (owner only)
  `);
});

export default app;
