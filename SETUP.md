# QRart - Local Development (FREE)

Get your app running on your Mac right now, 100% free.

## Option 1: Simplest - No Docker (Recommended for Now)

### Prerequisites

1. **Install Node.js** (if you don't have it):
   - Download from https://nodejs.org (v18+)
   - Or: `brew install node`

2. **Install PostgreSQL** (if you don't have it):
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

### Run QRart

```bash
# 1. Go to project
cd /Users/thijs/Coding/QRart

# 2. Install dependencies
npm install

# 3. Create database (one time)
createdb qrart

# 4. Set up environment
cp .env.example .env
# Edit .env if needed (default settings work locally)

# 5. Run migrations
npm run prisma:migrate:dev
# When prompted: name it "init" (or anything)

# 6. Start the server
npm run dev
```

Done! Go to: **http://localhost:4000**

---

## Option 2: With Docker (If you have it)

```bash
docker-compose up
```

That's it. Database + app start automatically.

---

## Option 3: Expose to Internet (Still FREE)

Once it's running locally on port 4000:

```bash
# Install cloudflared (one time)
brew install cloudflare/cloudflare/cloudflared

# In a new terminal, expose your local app
cloudflared tunnel --url http://localhost:4000
```

You get: `https://xxxxx.trycloudflare.com`

Share that URL! Users can:
- Upload images
- Install extension with that URL
- See everything work

---

## Building the Extension

```bash
cd browser-extension
npm install
npm run build
```

Then:
1. Open `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `browser-extension/dist/`
5. Click the extension icon → set backend URL

---

## What You Have Now

✅ **Backend API** running on your machine
✅ **PostgreSQL database** storing images
✅ **Upload page** at http://localhost:4000
✅ **Browser extension** to reveal images
✅ **100% FREE** - no cloud providers needed

---

## All Commands

```bash
# Start server
npm run dev

# Create migrations
npm run prisma:migrate:dev

# View database GUI
npm run prisma:studio

# Build extension
cd browser-extension && npm run build

# Build backend (for production)
npm run build
```

---

## Next Steps

1. Run `npm run dev` locally
2. Upload an image, copy the marker
3. Build & load extension
4. Test on Twitter with the marker
5. When ready: expose with cloudflared for real users
6. Later: deploy to cheap VPS ($4/month) if needed

**That's your full MVP, free, running on your machine right now!**
