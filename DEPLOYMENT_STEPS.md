# 🚀 Quick Railway Deployment Checklist

## Step 1: GitHub (✅ Already Done!)
Your code is already pushed to GitHub at:
```
https://github.com/gameboyt1710/QRart
```

## Step 2: Create Railway Project (5 minutes)

Go to https://railway.app and:

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find **QRart** in the list
4. Click it to import
5. Railway detects it as Node.js ✓

## Step 3: Add PostgreSQL Database (3 minutes)

In your Railway project dashboard:

1. Click **"New"** (top right)
2. Select **"Database"** → **"PostgreSQL"**
3. Wait for it to create (1-2 minutes)
4. Railway automatically sets `DATABASE_URL` ✓

## Step 4: 🔴 CRITICAL - Set Root Directory (2 minutes)

This is the most important step! Your build was failing because of this.

1. Click on your **Node.js service** (not the database)
2. Go to **"Settings"** tab (right sidebar)
3. Find **"Root Directory"** field
4. Type: `apps/backend`
5. Click outside the field to save
6. **Trigger a new deploy** by clicking "Redeploy"

```
Root Directory: apps/backend  ← This is CRITICAL!
```

## Step 5: Set Environment Variables (3 minutes)

In the same service, go to **"Variables"** tab:

1. Click **"New Variable"**
2. Add these variables:

| Name | Value | Note |
|------|-------|------|
| `API_KEYS` | `dev-key-1,dev-key-2` | Generate your own keys |
| `NODE_ENV` | `production` | Required for production |
| `CORS_ORIGINS` | *(leave empty or your domain)* | Optional |

3. Each variable should auto-save ✓

**Important**: 
- `DATABASE_URL` is already set by Railway automatically
- `PORT` is already set by Railway automatically

## Step 6: Deploy! (5-10 minutes)

Once you've set the root directory:

1. Railway should automatically trigger a new build
2. Watch the "Deployments" tab for progress
3. Build logs show:
   - `✓ npm install`
   - `✓ prisma:generate`
   - `✓ build:full` (backend + web)
   - `✓ prisma:migrate:prod`
   - `✓ Server started`

4. When done, you'll get a Railway domain:
   ```
   https://your-app-name.up.railway.app
   ```

## Step 7: Test Your Deployment (5 minutes)

### Test Web UI
Open in browser:
```
https://your-app-name.up.railway.app
```
You should see the QRart upload interface! ✓

### Test API
```bash
curl https://your-app-name.up.railway.app/health
```
Should return `200 OK` ✓

### Test Upload
1. Go to https://your-app-name.up.railway.app
2. Upload an image
3. Copy the QR code data
4. It should work! ✓

## Step 8: Build & Load Extension (5 minutes)

1. Open terminal, go to your project:
   ```bash
   cd /path/to/QRart
   cd apps/extension
   npm run build
   ```

2. Open `chrome://extensions`
3. Enable **"Developer mode"** (top right)
4. Click **"Load unpacked"**
5. Select `apps/extension/dist/`

6. Click the extension icon
7. Set:
   - Backend URL: `https://your-app-name.up.railway.app`
   - API Key: One from your `API_KEYS` list
   - Click "Save"

## ✅ You're Done!

Your QRart MVP is now:
- 🌐 Live on Railway
- 🗄️ Using PostgreSQL
- 🎨 Serving your web UI
- 🔌 Ready for the extension
- 📝 Deployed from git (auto-deploys on push!)

---

## 🆘 If Something Goes Wrong

### Build fails with "No start command"
→ Go to Settings and set **Root Directory** to `apps/backend`

### Extension can't connect
→ Check the Backend URL matches your Railway domain

### Database connection error
→ Make sure PostgreSQL service is running and DATABASE_URL is set

### Need to redeploy?
Just push to GitHub:
```bash
git push
```
Railway automatically redeploys! 🚀

---

## 💰 Monthly Cost

```
Node.js Service:  $5-10/month
PostgreSQL:       $5-10/month
─────────────────────────────
Total:            $10-20/month
```

Much cheaper than multi-service! ✅

---

## 📚 Documentation

- Full guide: `RAILWAY.md`
- Architecture: `ARCHITECTURE.md`
- Quick reference: `QUICKSTART.md`
- Project status: `STATUS.md`
