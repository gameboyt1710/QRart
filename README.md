# QRart - Encoded Art for X/Twitter

Upload artwork → Get a marker like `~ART:abc123~` → Post on X/Twitter → Users with the browser extension see your art.

Artists keep control over their work. Designed to discourage AI training and unauthorized use.

## Deploy to Railway (with PostgreSQL)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) and sign in
3. Click "New Project" → "Deploy from GitHub repo"
4. **Add PostgreSQL:**
   - Click **"+ New"**
   - Select **"Database"** → **"Add PostgreSQL"**
   - Railway creates `DATABASE_URL` automatically
5. Add environment variables in **"Variables"** tab:
   ```
   API_KEYS=your-secret-key-1,your-secret-key-2
   NODE_ENV=production
   ```
6. Railway auto-deploys ✓

## Browser Extension

The extension replaces markers with actual artwork on X/Twitter.

1. Build it:
   ```bash
   cd browser-extension
   npm install
   npm run build
   ```
2. Load in Chrome:
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" → select `browser-extension/dist/`
3. Configure:
   - Click extension icon
   - Enter your Railway URL and API key
   - Save

## Local Development

```bash
npm install
DATABASE_URL=postgresql://user:pass@localhost/qrart npm run dev
```

Open http://localhost:4000

## How It Works

1. **Artist uploads** artwork via web UI at `/`
2. **Gets a marker** like `~ART:abc123~`  
3. **Posts marker** in a tweet (not the image itself)
4. **Extension detects marker** and fetches the real artwork
5. **Artwork displays** in place of the marker

## "Do Not Train" Policy

- `robots.txt` blocks AI crawlers
- `X-Robots-Tag` headers on all artwork responses
- Terms of service prohibit AI training
- API key authentication controls access

These are legal/policy measures to protect artists' work.
