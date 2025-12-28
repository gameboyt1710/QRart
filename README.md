# QRart - Encoded Art Platform

A platform that lets artists post encoded images on X/Twitter while the real artwork is stored and served from your own platform under your own terms.

## 🎯 Overview

QRart consists of three parts:

1. **Backend API** (`apps/backend`) - Node.js/Express/Prisma API that stores and serves artwork
2. **Web UI** (`apps/web`) - React app for artists to upload art and get markers
3. **Browser Extension** (`apps/extension`) - WebExtension that reveals artwork on X/Twitter

## 🚀 Quick Start (Local Development)

Run the setup script:

```bash
chmod +x setup.sh
./setup.sh
```

Or follow manual steps below:

## 📋 Manual Setup

### Prerequisites

- Node.js 20+
- PostgreSQL (or use Docker)
- npm

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up the Database

```bash
# Start PostgreSQL (if using Docker)
docker run --name qrart-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=qrart \
  -p 5432:5432 \
  -d postgres:15

# Navigate to backend
cd apps/backend

# Copy environment file
cp .env.example .env
# Edit .env with your database URL if needed

# Run migrations
npm run prisma:migrate

# (Optional) Seed with test API keys
npx prisma db seed
```

### 3. Start the Backend

```bash
cd apps/backend
npm run dev
# Backend runs at http://localhost:4000
```

### 4. Start the Web UI

In a new terminal:

```bash
cd apps/web
npm run dev
# Web UI runs at http://localhost:5173
```

### 5. Build & Install the Extension

In a new terminal:

```bash
cd apps/extension
npm run build
```

Then load in Chrome:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `apps/extension/dist` folder

## 🔧 Configuration

### Extension Setup

1. Click the extension icon in Chrome
2. Enter Backend URL: `http://localhost:4000`
3. Enter API key: `dev-api-key-12345`
4. Click "Save Settings"
5. Refresh X/Twitter

## 📦 Usage

### For Artists

1. Open the web UI at http://localhost:5173
2. Enter your API key (default dev key: `dev-api-key-12345`)
3. Upload an image
4. Copy the marker (e.g., `~ART:4F9A21~`)
5. Paste the marker in your X/Twitter post

### For Viewers

1. Install the browser extension
2. Click the extension icon and enter:
   - Backend URL: `http://localhost:4000`
   - API key: `dev-api-key-12345`
3. Visit X/Twitter
4. Posts with markers will automatically show the artwork!

## Project Structure

```
qrart/
├── apps/
│   ├── backend/          # Express API + Prisma
│   │   ├── prisma/       # Database schema
│   │   └── src/
│   │       ├── index.ts        # Server entry
│   │       ├── routes/         # API routes
│   │       ├── middleware/     # Auth, rate limiting
│   │       └── lib/            # Prisma client
│   │
│   ├── web/              # React web app
│   │   └── src/
│   │       ├── App.tsx         # Main component
│   │       └── index.css       # Styles
│   │
│   └── extension/        # Browser extension
│       ├── public/             # Static files + manifest
│       └── src/
│           ├── contentScript.ts  # Runs on X/Twitter
│           ├── options.ts        # Settings page
│           └── background.ts     # Service worker
│
├── packages/
│   └── shared/           # Shared types (optional)
│
└── package.json          # Workspace root
```

## API Reference

### POST /api/artworks

Upload new artwork.

**Headers:**
- `x-api-key`: Your API key

**Body (multipart/form-data):**
- `file`: Image file (JPEG, PNG, GIF, WebP)
- `title`: Optional title

**Response:**
```json
{
  "id": "clx123...",
  "shortId": "4F9A21",
  "marker": "~ART:4F9A21~"
}
```

### GET /api/artworks/:shortId

Get artwork metadata or image.

**Headers:**
- `x-api-key`: Your API key

**Query params:**
- `format`: `json` (default) or `image`

**Response (format=json):**
```json
{
  "shortId": "4F9A21",
  "title": "My Artwork",
  "mimeType": "image/png",
  "dataUrl": "data:image/png;base64,...",
  "imageUrl": "http://localhost:4000/api/artworks/4F9A21?format=image"
}
```

### DELETE /api/artworks/:shortId

Delete artwork (owner only).

### GET /robots.txt

Returns robots.txt that discourages AI training.

### GET /terms

Returns terms of service page.

## 🚂 Deployment to Railway

**📖 See [RAILWAY.md](./RAILWAY.md) for complete deployment guide.**

### Quick Deploy:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/qrart.git
   git push -u origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - "New Project" → "Deploy from GitHub repo"
   - Add PostgreSQL database (automatic)
   - Set root directory: `apps/backend`
   - Add env vars: `API_KEYS`, `NODE_ENV=production`

3. **Done!**
   - API + Web UI: `https://your-app.railway.app`
   - Single service serves both!

4. **Extension** (local build):
   ```bash
   cd apps/extension
   npm run build
   # Load dist/ folder in chrome://extensions
   # Configure with Railway URL
   ```

Railway handles:
- ✅ Dependency installation
- ✅ Backend + Web UI builds
- ✅ Database migrations
- ✅ HTTPS certificates
- ✅ Auto-deployments on git push

**Estimated cost**: ~$10-20/month (single service + database)

---

## 🔒 Security Notes

- **API Keys**: For MVP, use simple string keys. In production, hash them.
- **Rate Limiting**: In-memory for MVP. Use Redis in production.
- **File Storage**: DB storage for MVP. Use S3/R2 in production.
- **CORS**: Restrictive in production.

## "Do Not Train" Policy

The platform implements several measures to discourage AI training:

1. **robots.txt** blocks common AI crawlers
2. **X-Robots-Tag headers** signal no AI training
3. **Terms of Service** legally prohibit training
4. **API key authentication** controls access

These are policy measures, not technical enforcement.

## Development

```bash
# Run all in development
npm run dev:backend  # Terminal 1
npm run dev:web      # Terminal 2

# Build extension (watch mode)
cd apps/extension && npm run dev
```

## License

MIT
