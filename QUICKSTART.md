# QRart Quick Reference

## 🚀 Local Development

```bash
# 1. Install & setup
npm install
./setup.sh

# 2. Start database
docker run --name qrart-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=qrart \
  -p 5432:5432 -d postgres:15

# 3. Run migrations
cd apps/backend
npm run prisma:migrate
npm run prisma:seed

# 4. Start backend (terminal 1)
cd apps/backend
npm run dev

# 5. Start web UI (terminal 2)
cd apps/web
npm run dev

# 6. Build extension (terminal 3)
cd apps/extension
npm run build
# Load dist/ in chrome://extensions
```

**Default credentials:**
- API Key: `dev-api-key-12345`
- Backend: http://localhost:4000
- Web UI: http://localhost:5173

---

## 🚂 Railway Deployment

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/qrart.git
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Node.js project

### Step 3: Add PostgreSQL

1. Click "New" → "Database" → "PostgreSQL"
2. Railway automatically connects it
3. Sets `DATABASE_URL` env variable

### Step 4: Configure Service

1. Click on your service (not database)
2. Go to "Settings"
3. Set **Root Directory**: `apps/backend`
4. Add environment variables:
   ```
   API_KEYS=your-production-key-123,another-key-456
   NODE_ENV=production
   CORS_ORIGINS=https://your-app.railway.app
   ```

### Step 5: Deploy!

Railway automatically:
- Installs dependencies
- Builds backend + web UI
- Runs database migrations
- Starts server

**Your app**: `https://your-app-name.up.railway.app`

### Step 6: Configure Extension

```bash
# Build locally
cd apps/extension
npm run build

# Load in browser
# 1. chrome://extensions
# 2. Load unpacked → select dist/
# 3. Click extension icon
# 4. Enter Railway URL
# 5. Enter your production API key
# 6. Save
```

---

## 💰 Cost Breakdown

**Single Service (Recommended):**
- Node.js service: $5-10/month
- PostgreSQL: $5-10/month
- **Total: ~$10-20/month** ✅

This serves both API and Web UI from one service!

---

## 📝 Common Commands

### Backend
```bash
cd apps/backend
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
```

### Web UI
```bash
cd apps/web
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run start            # Serve production build
```

### Extension
```bash
cd apps/extension
npm run build            # Build extension
npm run dev              # Build with watch mode
npm run clean            # Clean dist folder
```

---

## 🔧 Environment Variables

### Backend (.env)
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/qrart"
PORT=4000
API_KEYS="dev-api-key-12345,artist-key-67890"
CORS_ORIGINS="http://localhost:5173"
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Web (.env)
```bash
VITE_API_BASE_URL=http://localhost:4000
```

### Extension Settings (in browser)
- Backend URL: `http://localhost:4000` or Railway URL
- API Key: One of your API keys

---

## 🐛 Troubleshooting

### "Prisma Client not generated"
```bash
cd apps/backend
npm run prisma:generate
```

### "Database connection failed"
```bash
# Check if PostgreSQL is running
docker ps

# Restart if needed
docker restart qrart-postgres

# Check DATABASE_URL in apps/backend/.env
```

### "Extension not detecting markers"
1. Check extension is configured (click icon)
2. Verify backend is running
3. Check API key is valid
4. Refresh X/Twitter page
5. Check browser console for errors

### "CORS errors in extension"
1. Update CORS_ORIGINS in backend
2. Restart backend
3. Refresh extension

### "Railway build fails"
1. Check build logs in Railway dashboard
2. Verify railway.toml exists
3. Check package.json scripts
4. Ensure DATABASE_URL is set

---

## 📦 Project Structure

```
QRart/
├── apps/
│   ├── backend/       # API server
│   ├── web/          # Upload UI
│   └── extension/    # Browser extension
├── packages/
│   └── shared/       # Shared types
├── RAILWAY.md        # Deployment guide
├── setup.sh          # Setup script
└── README.md         # Main docs
```

---

## 🎯 Workflow

### For Artists:
1. Go to web UI
2. Enter API key
3. Upload image
4. Copy marker: `~ART:abc123~`
5. Tweet the marker
6. Users with extension see your art!

### For Viewers:
1. Install extension
2. Configure backend URL & API key
3. Browse X/Twitter
4. Art appears automatically!

---

## 💡 Tips

- Keep your API keys secret
- Use different keys for dev/prod
- Monitor Railway logs for errors
- Test extension on private tweets first
- Rate limits: 100 requests/minute by default
- Max file size: 10MB

---

## 🔗 Links

- **Railway**: https://railway.app
- **Docs**: See README.md and RAILWAY.md
- **Backend API**: http://localhost:4000 (dev)
- **Web UI**: http://localhost:5173 (dev)

---

## ⚖️ License

MIT
