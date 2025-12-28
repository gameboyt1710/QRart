# QRart Web UI

React + Vite web application for artists to upload artwork and get markers.

## Setup

```bash
# Install dependencies
npm install

# Copy environment file (optional for dev)
cp .env.example .env
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app runs at http://localhost:5173 by default.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | (empty, uses proxy) |

In development, Vite proxies `/api` requests to `http://localhost:4000`.

For production, set `VITE_API_BASE_URL` to your backend URL.

## Features

- **API Key Management**: Enter and save your API key (stored in localStorage)
- **File Upload**: Drag and drop or click to select images
- **Image Preview**: See your image before uploading
- **Marker Generation**: Get a marker string to paste in tweets
- **QR Code**: Generate and download a QR code for your marker
- **Copy to Clipboard**: One-click copy of marker text

## Usage

1. Enter your API key in the settings section
2. Select an image file (JPEG, PNG, GIF, WebP up to 10MB)
3. Optionally add a title
4. Click "Upload & Get Marker"
5. Copy the marker (e.g., `~ART:4F9A21~`) to your clipboard
6. Paste it in your X/Twitter post!

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Set `VITE_API_BASE_URL` in Vercel's environment variables.

### Netlify

```bash
# Build
npm run build

# Deploy dist folder to Netlify
```

### Railway

Can be served by the backend or as a separate static service.

### Serving from Backend

For simplicity, you can serve the built web app from the backend:

1. Build: `npm run build`
2. Copy `dist` to `apps/backend/public`
3. Add to backend's `index.ts`:
   ```typescript
   app.use(express.static('public'));
   ```
