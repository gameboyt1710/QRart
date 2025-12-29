# QRart - Hidden Images for Twitter/X

Upload an image → get a QR marker (~QR:id~) → post on Twitter → users with extension see your art.

Twitter never sees the actual image. Only users with the extension can view it.

## Quick Start

### Option 1: Docker (Recommended)

```bash
docker-compose up
```

- Backend: http://localhost:4000
- PostgreSQL will start automatically
- Run migrations: `docker exec qrart-app npm run prisma:migrate:deploy`

### Option 2: Local Development

```bash
npm install
npm run dev
```

Need PostgreSQL running:
```bash
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=qrart -p 5432:5432 -d postgres:15
```

Then run migrations:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/qrart" npm run prisma:migrate:dev
```

## How It Works

1. **Upload**: Go to http://localhost:4000 and upload an image
2. **Get QR**: You get a marker like `~QR:abc123~`
3. **Post**: Put that marker in a tweet
4. **View**: Users with extension installed see your image

## Browser Extension

```bash
cd browser-extension
npm install
npm run build
```

In Chrome:
- Go to `chrome://extensions`
- Enable "Developer mode"
- Click "Load unpacked" → select `browser-extension/dist/`
- Click icon to set backend URL

## API

- `POST /upload` - Upload image, get QR marker
- `GET /image/:id` - Fetch image by ID
- `GET /health` - Health check

## Deployment

See `Dockerfile` and `docker-compose.yml` for production setup.

For VPS: build Docker image, push to your server, run with docker-compose.
