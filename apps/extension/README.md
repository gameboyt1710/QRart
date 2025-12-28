# QRart Browser Extension

WebExtension (Manifest V3) that reveals encoded artwork on X/Twitter.

## Building

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Build with watch mode (for development)
npm run dev
```

The built extension will be in the `dist` folder.

## Installation

### Chrome

1. Go to `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder

### Firefox

1. Go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `dist/manifest.json`

### Edge

1. Go to `edge://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

## Configuration

1. Click the extension icon in your browser toolbar
2. Enter your Backend URL (e.g., `http://localhost:4000` for dev)
3. Enter your API key
4. Click "Save Settings"
5. Refresh X/Twitter to apply

Settings are saved to `chrome.storage.sync`, so they persist across devices if you're signed into Chrome.

## How It Works

1. **Content Script** (`contentScript.ts`):
   - Runs on `x.com` and `twitter.com`
   - Scans tweet text for markers (`~ART:XXXX~`)
   - Fetches artwork from the backend
   - Injects images into tweets

2. **Background Script** (`background.ts`):
   - Handles cross-origin requests to avoid CORS issues
   - Proxies artwork fetches from content script

3. **Options Page** (`options.ts`):
   - Settings UI for backend URL and API key
   - Saves configuration to browser storage

## Marker Format

The extension looks for markers in this format:

```
~ART:<shortId>~
```

Where `<shortId>` is 4-20 alphanumeric characters (plus `-` and `_`).

Examples:
- `~ART:4F9A21~`
- `~ART:abc123~`
- `~ART:my-artwork-id~`

## Development

### Testing Locally

1. Start the backend: `cd apps/backend && npm run dev`
2. Build extension: `npm run dev` (watch mode)
3. Load unpacked in Chrome
4. Create a test post on X with a marker

### Debugging

- **Content Script**: Open DevTools on X/Twitter, check Console for "QRart:" logs
- **Background Script**: Go to `chrome://extensions`, click "service worker" link
- **Options Page**: Open the extension popup or options page, use DevTools

### Updating the Extension

1. Make changes to source files
2. Run `npm run build`
3. Go to `chrome://extensions`
4. Click the refresh icon on the QRart extension

## Production Deployment

### Chrome Web Store

1. Build: `npm run build`
2. Zip the `dist` folder
3. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Create new item
5. Upload the zip
6. Fill in listing details
7. Submit for review

### Firefox Add-ons

1. Build: `npm run build`
2. Zip the `dist` folder
3. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
4. Submit new add-on

### Updating Backend URL

Before publishing, update the default backend URL in:
- `src/options.ts`: Change `DEFAULT_BACKEND_URL`
- `public/manifest.json`: Update `host_permissions`

## Permissions Explained

- `storage`: Save user settings (API key, backend URL)
- `activeTab`: Access the current tab's content
- `host_permissions` for `x.com`/`twitter.com`: Run content scripts on these sites
- `host_permissions` for backend: Make API requests

## Troubleshooting

### "Extension not configured"
- Open the extension options
- Make sure both Backend URL and API key are set
- Save settings and refresh the page

### "Invalid API key"
- Verify your API key is correct
- Make sure the key exists in the backend's API_KEYS env variable or database

### Artwork not loading
- Check the browser console for errors
- Verify the backend is running
- Check if the artwork exists (try the API directly)

### CORS errors
- Ensure your backend's CORS settings allow the extension origin
- The background script should handle this, but check if it's running
