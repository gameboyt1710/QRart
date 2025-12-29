/**
 * QRart Extension - Content Script
 * Scans images in tweets, decodes QR codes to get image IDs, fetches and overlays artwork
 */

import jsQR from 'jsqr';

const processedIds = new Map<string, boolean>();

let config = {
  backendUrl: localStorage.getItem('backendUrl') || 'https://qrart-production.up.railway.app',
};

// Watch for new tweets
const observer = new MutationObserver(() => {
  document.querySelectorAll('article[data-testid="tweet"]').forEach(processTweet);
});

observer.observe(document.body, { childList: true, subtree: true });

async function processTweet(article: Element) {
  const images = article.querySelectorAll('img');

  for (const img of images) {
    try {
      // Skip if already processing this image
      if ((img as any).dataset.qrartProcessed) continue;
      (img as any).dataset.qrartProcessed = 'true';

      // Try to decode QR from this image
      const id = await decodeQRFromImage(img);
      if (!id || processedIds.has(id)) continue;

      processedIds.set(id, true);

      // Fetch artwork from backend
      console.log(`[QRart] Found QR code with ID: ${id}`);
      const response = await fetch(`${config.backendUrl}/image/${id}`);

      if (response.ok) {
        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);

        // Create overlay image
        const overlayImg = document.createElement('img');
        overlayImg.src = imgUrl;
        overlayImg.style.cssText = `
          max-width: 100%;
          max-height: 100%;
          border-radius: 8px;
          cursor: pointer;
          display: block;
        `;
        overlayImg.onclick = () => window.open(imgUrl);

        // Replace the QR code image with the artwork
        img.replaceWith(overlayImg);
        console.log(`[QRart] Replaced QR code with artwork for ID: ${id}`);
      }
    } catch (err) {
      // Silently fail - not all images are QR codes
    }
  }
}

async function decodeQRFromImage(img: HTMLImageElement): Promise<string | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(null);

    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';

    tempImg.onload = () => {
      canvas.width = tempImg.width;
      canvas.height = tempImg.height;
      ctx.drawImage(tempImg, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height);

        if (decoded && decoded.data) {
          // Extract ID from decoded data (should be just the ID)
          const id = decoded.data.trim();
          // Validate it looks like an ID (alphanumeric, 4-20 chars)
          if (/^[A-Za-z0-9_-]{4,20}$/.test(id)) {
            resolve(id);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      } catch (err) {
        resolve(null);
      }
    };

    tempImg.onerror = () => resolve(null);
    tempImg.src = img.src;
  });
}

// Listen for config changes
window.addEventListener('storage', (e) => {
  if (e.key === 'backendUrl') {
    config.backendUrl = e.newValue || 'https://qrart-production.up.railway.app';
  }
});
