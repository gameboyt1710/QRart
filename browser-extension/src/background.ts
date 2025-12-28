/**
 * QRart Extension - Background Service Worker
 * 
 * Handles cross-origin requests and message passing between
 * content scripts and the options page.
 * 
 * In Manifest V3, background scripts run as service workers,
 * which means they can be terminated when idle and wake up
 * when needed.
 */

// Listen for messages from content scripts or options page
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'FETCH_ARTWORK') {
    // Proxy artwork fetch to avoid CORS issues
    fetchArtwork(message.backendUrl, message.shortId, message.apiKey)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'CONFIG_UPDATED') {
    // Could notify all tabs to reload config, but for MVP
    // we just rely on users refreshing the page
    console.log('Config updated');
  }
});

/**
 * Fetch artwork data from the backend
 * This runs in the background to avoid CORS restrictions
 */
async function fetchArtwork(
  backendUrl: string,
  shortId: string,
  apiKey: string
): Promise<{ success: boolean; data?: ArtworkData; error?: string }> {
  try {
    const response = await fetch(
      `${backendUrl}/api/artworks/${shortId}?format=json`,
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { success: false, error: 'Invalid API key' };
      }
      if (response.status === 404) {
        return { success: false, error: 'Artwork not found' };
      }
      return { success: false, error: `Server error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch artwork:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

interface ArtworkData {
  shortId: string;
  title: string | null;
  mimeType: string;
  dataUrl?: string;
  imageUrl?: string;
}

// Log when service worker starts
console.log('QRart background service worker started');
