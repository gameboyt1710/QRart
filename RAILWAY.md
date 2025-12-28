# Railway Deployment Guide

This project is configured for seamless deployment on Railway.

## Prerequisites

1. A Railway account (https://railway.app)
2. GitHub repository with your code
3. PostgreSQL database on Railway

## Setup Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: QRart MVP"
git branch -M main
git remote add origin https://github.com/yourusername/qrart.git
git push -u origin main
```

### 2. Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your QRart repository

### 3. Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will create the database and set DATABASE_URL automatically

### 4. Deploy Backend

1. Click "New" → "GitHub Repo"
2. Select your repository
3. Configure the service:
   - **Name**: qrart-backend
   - **Root Directory**: `apps/backend`
   - **Build Command**: (auto-detected from railway.toml)
   - **Start Command**: (auto-detected from railway.toml)

4. Add environment variables:
   - `DATABASE_URL`: (automatically set by Railway Postgres)
   - `API_KEYS`: Your production API keys (e.g., `prod-key-123,artist-key-456`)
   - `CORS_ORIGINS`: Your frontend domain (e.g., `https://qrart-web.up.railway.app`)
   - `NODE_ENV`: `production`

5. Click "Deploy"

### 5. Deploy Web UI

1. Click "New" → "GitHub Repo"
2. Select your repository again
3. Configure the service:
   - **Name**: qrart-web
   - **Root Directory**: `apps/web`
   - **Build Command**: (auto-detected from railway.toml)
   - **Start Command**: (auto-detected from railway.toml)

4. Add environment variable:
   - `VITE_API_BASE_URL`: Your backend URL (e.g., `https://qrart-backend.up.railway.app`)

5. Click "Deploy"

### 6. Update CORS Settings

Once both services are deployed:

1. Go to backend service settings
2. Update `CORS_ORIGINS` environment variable with your web UI URL
3. Redeploy if needed

### 7. Configure Extension

1. Build the extension locally:
   ```bash
   cd apps/extension
   npm run build
   ```

2. Update the extension to use your Railway backend:
   - Open extension settings after installation
   - Set Backend URL to your Railway backend URL
   - Set API Key to your production key

3. Load in browser:
   - Chrome: `chrome://extensions` → "Load unpacked" → select `dist/`
   - Firefox: `about:debugging` → "Load Temporary Add-on"

## Railway Configuration Files

### Backend (`apps/backend/railway.toml`)
```toml
[build]
builder = "nixpacks"
buildCommand = "npm install && npm run prisma:generate && npm run build"

[deploy]
startCommand = "npm run prisma:migrate:prod && npm run start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### Web (`apps/web/railway.toml`)
```toml
[build]
builder = "nixpacks"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run start"
```

## Automatic Deployments

Railway will automatically deploy when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push
```

## Environment Variables Summary

### Backend Service
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection (auto) | `postgresql://...` |
| `API_KEYS` | Comma-separated API keys | `prod-key-123,artist-key-456` |
| `CORS_ORIGINS` | Allowed origins | `https://your-web.railway.app` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port (auto) | `3000` |

### Web Service
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://your-backend.railway.app` |
| `PORT` | Server port (auto) | `3000` |

## Database Migrations

Migrations run automatically on backend deployment via the startCommand in railway.toml.

To run migrations manually:
```bash
railway run npm run prisma:migrate:prod
```

## Monitoring

- **Logs**: View in Railway dashboard for each service
- **Health**: Backend has `/health` endpoint
- **Metrics**: Railway provides CPU, memory, and network metrics

## Costs

Railway offers:
- **Free tier**: $5/month usage
- **Pro tier**: $20/month + usage

Estimated monthly cost for this MVP:
- Database: ~$5-10
- Backend: ~$5-10
- Web: ~$2-5
- **Total**: ~$12-25/month

## Troubleshooting

### Database connection fails
- Check DATABASE_URL is set correctly
- Ensure Postgres service is running
- Verify network connectivity between services

### CORS errors
- Update CORS_ORIGINS in backend
- Include both http and https if testing locally

### Build fails
- Check build logs in Railway dashboard
- Verify package.json scripts are correct
- Ensure all dependencies are in package.json

### Extension can't connect
- Verify backend URL in extension settings
- Check API key is valid
- Ensure backend is deployed and healthy

## Support

For Railway-specific issues:
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Support: help@railway.app
