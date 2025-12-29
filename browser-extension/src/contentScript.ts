/**
 * QRart Extension - Content Script
 * Detects ~QR:id~ markers and replaces them with actual images
 */

const QR_REGEX = /~QR:([A-Za-z0-9_-]{4,20})~/g;
const processedMarkers = new Map<string, boolean>();

let config = {
  backendUrl: localStorage.getItem('backendUrl') || 'https://qrart-production.up.railway.app',
};

// Watch for new tweets
const observer = new MutationObserver(() => {
  document.querySelectorAll('article[data-testid="tweet"]').forEach(processTweet);
});

observer.observe(document.body, { childList: true, subtree: true });

async function processTweet(article: Element) {
  const text = article.textContent || '';
  let match;

  while ((match = QR_REGEX.exec(text)) !== null) {
    const id = match[1];
    if (processedMarkers.has(id)) continue;

    processedMarkers.set(id, true);

    try {
      // Fetch image from backend
      const imageUrl = `${config.backendUrl}/image/${id}`;
      const response = await fetch(imageUrl);

      if (response.ok) {
        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);

        // Find the marker in tweet and replace with image
        const textElements = Array.from(article.querySelectorAll('[role="textbox"], span, p'));
        for (const el of textElements) {
          if (el.textContent?.includes(match[0])) {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.style.cssText =
              'max-width: 100%; max-height: 500px; border-radius: 8px; margin: 8px 0; cursor: pointer;';
            img.onclick = () => window.open(imgUrl);

            el.parentElement?.insertBefore(img, el.nextSibling);
            break;
          }
        }
      }
    } catch (err) {
      console.log(`Failed to fetch image ${id}:`, err);
    }
  }
}

// Listen for config changes
window.addEventListener('storage', (e) => {
  if (e.key === 'backendUrl') {
    config.backendUrl = e.newValue || 'http://localhost:4000';
  }
});
