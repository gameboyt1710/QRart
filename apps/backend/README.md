# QRart Backend

Express + Prisma + PostgreSQL API for storing and serving artwork.

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database URL

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 4000 |
| `API_KEYS` | Comma-separated API keys | Required |
| `CORS_ORIGINS` | Comma-separated allowed origins | `*` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | 60000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## API Endpoints

### POST /api/artworks

Upload new artwork.

```bash
curl -X POST http://localhost:4000/api/artworks \
  -H "x-api-key: dev-api-key-12345" \
  -F "file=@./my-artwork.png" \
  -F "title=My Amazing Art"
```

### GET /api/artworks/:shortId

Get artwork metadata or image.

```bash
# Get metadata (JSON)
curl http://localhost:4000/api/artworks/ABC123 \
  -H "x-api-key: dev-api-key-12345"

# Get raw image
curl http://localhost:4000/api/artworks/ABC123?format=image \
  -H "x-api-key: dev-api-key-12345" \
  --output artwork.png
```

### DELETE /api/artworks/:shortId

Delete artwork (owner only).

```bash
curl -X DELETE http://localhost:4000/api/artworks/ABC123 \
  -H "x-api-key: dev-api-key-12345"
```

## Production Deployment

### Railway

1. Push to Git
2. Create Railway project with PostgreSQL
3. Set environment variables
4. Build: `npm run build && npm run prisma:migrate:prod`
5. Start: `npm run start`

### Switching to S3/R2 Storage

For production, you'll want to use object storage instead of DB storage:

1. Install AWS SDK: `npm install @aws-sdk/client-s3`
2. Create a storage service in `src/lib/storage.ts`
3. Update the artwork routes to use the storage service
4. Store URLs instead of binary data in the database

Example S3 integration:

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Upload
await s3.send(new PutObjectCommand({
  Bucket: process.env.S3_BUCKET,
  Key: `artworks/${shortId}`,
  Body: fileBuffer,
  ContentType: mimeType,
}));

// Generate signed URL for viewing
const url = await getSignedUrl(s3, new GetObjectCommand({
  Bucket: process.env.S3_BUCKET,
  Key: `artworks/${shortId}`,
}), { expiresIn: 3600 });
```
