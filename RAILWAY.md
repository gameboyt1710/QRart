# Railway Deployment Guide

This project uses a **single-service architecture** for Railway deployment, which is more cost-effective than deploying multiple services.

## 🏗️ Architecture

**Single Node.js Service:**
- Backend API (Express)
- Web UI (serves built React app)
- PostgreSQL Database (separate Railway service)

**Why this approach?**
- ✅ Lower cost (~$10-20/month vs ~$15-30/month)
- ✅ No CORS issues (same origin)
- ✅ Simpler deployment (one service to manage)
- ✅ Same as your imagethingy project approach

## 📋 Prerequisites

1. A Railway account (https://railway.app)
2. GitHub repository with your code
3. Railway CLI (optional): `npm install -g @railway/cli`

## 🚀 Deployment Steps

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: QRart MVP"
git branch -M main
git remote add origin https://github.com/yourusername/qrart.git
git push -u origin main
```

### Step 2: Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your QRart repository
5. Railway will detect it as a Node.js project

### Step 3: Add PostgreSQL Database

1. In your Railway project dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will:
   - Create the database
   - Automatically set `DATABASE_URL` environment variable
   - Connect it to your service

### Step 4: Configure the Service

1. Click on your service (not the database)
2. Go to "Settings"
3. **🔴 CRITICAL**: Set **Root Directory**: `apps/backend`
   - This tells Railway to look for `apps/backend/railway.toml`
   - This is where the build/start commands are defined
   - Without this, Railway won't find the configuration
4. Railway will auto-detect build/start commands from `apps/backend/railway.toml`

### Step 5: Set Environment Variables

In your service settings, add these variables:

```bash
# Required
API_KEYS=prod-key-123,artist-key-456
NODE_ENV=production

# Optional (Railway sets these automatically)
# DATABASE_URL=<automatically set>
# PORT=<automatically set>

# CORS - use your Railway domain or leave empty for same-origin
CORS_ORIGINS=https://your-app.railway.app
```

**To add variables:**
1. Go to service → "Variables" tab
2. Click "New Variable"
3. Add each variable

### Step 6: Deploy!

1. Click "Deploy" or just push to GitHub
2. Railway will:
   - Install dependencies
   - Build the backend
   - Build the web UI
   - Run database migrations
   - Start the server

**Your app will be available at:** `https://your-app-name.up.railway.app`

## 🔌 Extension Configuration

After deployment:

1. Build the extension locally:
   ```bash
   cd apps/extension
   npm run build
   ```

2. Load in browser:
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `apps/extension/dist/`

3. Configure extension:
   - Click extension icon
   - Backend URL: `https://your-app-name.up.railway.app`
   - API Key: One of your production keys from `API_KEYS`
   - Click "Save"

## 🔄 Auto-Deployments

Railway automatically deploys when you push to your main branch:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Railway deploys automatically! 🚀
```

## 📊 What Gets Built

The Railway build process:

1. **Install dependencies** (`npm install`)
2. **Generate Prisma Client** (`npm run prisma:generate`)
3. **Build backend** (TypeScript → JavaScript in `apps/backend/dist/`)
4. **Build web UI** (React → static files in `apps/web/dist/`)
5. **Run migrations** (`npm run prisma:migrate:prod`)
6. **Start server** (`npm run start`)

The backend then serves:
- API endpoints at `/api/*`
- Web UI at all other routes (SPA mode)

The backend then serves:
- API endpoints at `/api/*`
- Web UI at all other routes (SPA mode)

## 🌐 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ (auto) | PostgreSQL connection | Railway sets automatically |
| `API_KEYS` | ✅ | Comma-separated API keys | `prod-key-123,artist-key-456` |
| `NODE_ENV` | ✅ | Environment name | `production` |
| `PORT` | (auto) | Server port | Railway sets automatically |
| `CORS_ORIGINS` | Optional | Allowed origins | Your Railway domain or empty |

## 💰 Cost Breakdown

**Single Service Deployment:**
- Node.js service: $5-10/month
- PostgreSQL database: $5-10/month
- **Total: ~$10-20/month**

**vs. Multiple Services (old approach):**
- Backend service: $5-10/month
- Web service: $5-10/month
- PostgreSQL: $5-10/month  
- **Total: ~$15-30/month**

**You save ~$5-10/month with single-service!** 💰

## 🔍 Monitoring

### View Logs
1. Go to your service in Railway
2. Click "Logs" tab
3. View real-time logs

### Health Check
Your backend has a health endpoint:
```bash
curl https://your-app.railway.app/health
```

### Database
1. Click on PostgreSQL service
2. View connection details
3. Monitor usage and performance

## 🐛 Troubleshooting

### ❌ "No start command was found"
**Problem**: Railway can't find how to start your app.

**Solution**:
1. Go to service → "Settings"
2. Set **Root Directory** to `apps/backend`
3. Railway will then find `apps/backend/railway.toml` and `apps/backend/package.json`
4. Redeploy

**Why this happens**: Your monorepo has a root `package.json` without a start command. Railway needs to look in `apps/backend` instead.

### ❌ "railway.toml not rooted at valid path"
**Problem**: Railway.toml exists but Railway isn't reading it.

**Cause**: Root directory is not set to `apps/backend`

**Solution**:
1. In Railway dashboard, click on your service
2. Go to "Settings" tab
3. Find "Root Directory" 
4. Set it to `apps/backend`
5. Trigger a new deploy

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
