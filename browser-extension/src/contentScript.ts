/**
 * QRart Extension - Content Script
 * 
 * This script runs on X/Twitter pages and:
 * 1. Scans for QRart markers in tweet text
 * 2. Fetches the corresponding artwork from the backend
 * 3. Injects the artwork images into the tweets
 * 
 * The marker format is: ~ART:<shortId>~
 * Example: ~ART:4F9A21~
 */

// ============================================
// Types
// ============================================

interface ExtensionConfig {
  apiKey: string;
  backendBaseUrl: string;
}

interface ArtworkData {
  shortId: string;
  title: string | null;
  mimeType: string;
  dataUrl?: string;
  imageUrl?: string;
}

interface FetchResponse {
  success: boolean;
  data?: ArtworkData;
  error?: string;
}

// ============================================
// Constants
// ============================================

// Marker regex: ~ART:<shortId>~
const MARKER_REGEX = /~ART:([A-Za-z0-9_-]{4,20})~/g;

// Track processed tweets to avoid duplicate processing
const processedTweets = new WeakSet<Element>();
const processedMarkers = new Map<string, Promise<FetchResponse>>();

// Extension configuration
let config: ExtensionConfig | null = null;

// ============================================
// Configuration
// ============================================

/**
 * Load configuration from chrome.storage
 */
async function loadConfig(): Promise<ExtensionConfig | null> {
  try {
    const result = await chrome.storage.sync.get(['apiKey', 'backendBaseUrl']);
    
    if (result.apiKey && result.backendBaseUrl) {
      return {
        apiKey: result.apiKey,
        backendBaseUrl: result.backendBaseUrl.replace(/\/$/, ''),
      };
    }
    
    console.log('QRart: Extension not configured. Please set API key in options.');
    return null;
  } catch (error) {
    console.error('QRart: Failed to load config:', error);
    return null;
  }
}

// ============================================
// Artwork Fetching
// ============================================

/**
 * Fetch artwork from the backend via the background script
 * Uses the background script to avoid CORS issues
 */
async function fetchArtwork(shortId: string): Promise<FetchResponse> {
  if (!config) {
    return { success: false, error: 'Extension not configured' };
  }

  // Check if we already have a pending request for this shortId
  const existing = processedMarkers.get(shortId);
  if (existing) {
    return existing;
  }

  // Create new request
  const promise = new Promise<FetchResponse>((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: 'FETCH_ARTWORK',
        backendUrl: config!.backendBaseUrl,
        shortId,
        apiKey: config!.apiKey,
      },
      (response: FetchResponse) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || { success: false, error: 'No response' });
        }
      }
    );
  });

  processedMarkers.set(shortId, promise);
  return promise;
}

// ============================================
// DOM Manipulation
// ============================================

/**
 * Create the artwork container element
 */
function createArtworkElement(artwork: ArtworkData): HTMLElement {
  const container = document.createElement('div');
  container.className = 'qrart-container';
  
  // Header with badge and title
  const header = document.createElement('div');
  header.className = 'qrart-header';
  
  const badge = document.createElement('span');
  badge.className = 'qrart-badge';
  badge.innerHTML = '🎨 QRart';
  header.appendChild(badge);
  
  if (artwork.title) {
    const title = document.createElement('span');
    title.className = 'qrart-title';
    title.textContent = artwork.title;
    header.appendChild(title);
  }
  
  container.appendChild(header);
  
  // Image
  const img = document.createElement('img');
  img.className = 'qrart-image';
  img.alt = artwork.title || 'QRart artwork';
  
  // Use dataUrl if available, otherwise imageUrl
  if (artwork.dataUrl) {
    img.src = artwork.dataUrl;
  } else if (artwork.imageUrl) {
    img.src = artwork.imageUrl;
  }
  
  // Handle image load errors
  img.onerror = () => {
    container.innerHTML = '';
    const error = document.createElement('div');
    error.className = 'qrart-error';
    error.textContent = 'Failed to load artwork';
    container.appendChild(error);
  };
  
  container.appendChild(img);
  
  return container;
}

/**
 * Create a loading placeholder
 */
function createLoadingElement(): HTMLElement {
  const loading = document.createElement('div');
  loading.className = 'qrart-container qrart-loading';
  loading.textContent = 'Loading artwork...';
  return loading;
}

/**
 * Create an error element
 */
function createErrorElement(message: string): HTMLElement {
  const error = document.createElement('div');
  error.className = 'qrart-error';
  error.textContent = message;
  return error;
}

/**
 * Process a single tweet element
 */
async function processTweet(tweetEl: Element): Promise<void> {
  // Skip if already processed
  if (processedTweets.has(tweetEl)) {
    return;
  }
  processedTweets.add(tweetEl);

  // Find tweet text content
  // X/Twitter uses data-testid="tweetText" for tweet content
  const textEl = tweetEl.querySelector('[data-testid="tweetText"]');
  if (!textEl) {
    return;
  }

  const text = textEl.textContent || '';
  const matches = [...text.matchAll(MARKER_REGEX)];
  
  if (matches.length === 0) {
    return;
  }

  // Process each marker found
  for (const match of matches) {
    const fullMarker = match[0]; // e.g., ~ART:4F9A21~
    const shortId = match[1];    // e.g., 4F9A21
    
    console.log(`QRart: Found marker ${fullMarker}`);
    
    // Find the text node containing the marker
    const walker = document.createTreeWalker(
      textEl,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent?.includes(fullMarker)) {
        // Insert loading placeholder after the tweet text
        const loadingEl = createLoadingElement();
        textEl.parentNode?.insertBefore(loadingEl, textEl.nextSibling);
        
        // Fetch artwork
        const response = await fetchArtwork(shortId);
        
        // Replace loading with result
        if (response.success && response.data) {
          const artworkEl = createArtworkElement(response.data);
          loadingEl.replaceWith(artworkEl);
          
          // Optionally style the marker text to be less prominent
          // We don't hide it completely so users can still see/copy it
          const markerSpan = document.createElement('span');
          markerSpan.className = 'qrart-marker';
          markerSpan.textContent = fullMarker;
          
          // Replace marker text with styled span
          const textContent = node.textContent;
          if (textContent) {
            const beforeText = textContent.substring(0, textContent.indexOf(fullMarker));
            const afterText = textContent.substring(textContent.indexOf(fullMarker) + fullMarker.length);
            
            const fragment = document.createDocumentFragment();
            if (beforeText) fragment.appendChild(document.createTextNode(beforeText));
            fragment.appendChild(markerSpan);
            if (afterText) fragment.appendChild(document.createTextNode(afterText));
            
            node.parentNode?.replaceChild(fragment, node);
          }
        } else {
          const errorEl = createErrorElement(
            response.error || 'Protected artwork - configure extension'
          );
          loadingEl.replaceWith(errorEl);
        }
        
        break; // Only process first occurrence per marker
      }
    }
  }
}

// ============================================
// Observer Setup
// ============================================

/**
 * Find tweet elements in the DOM
 * X/Twitter uses article elements with data-testid="tweet"
 */
function findTweets(): Element[] {
  return Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
}

/**
 * Process all visible tweets
 */
function processAllTweets(): void {
  if (!config) return;
  
  const tweets = findTweets();
  tweets.forEach(tweet => processTweet(tweet));
}

/**
 * Set up MutationObserver to watch for new tweets
 */
function setupObserver(): void {
  const observer = new MutationObserver((mutations) => {
    // Debounce processing
    let hasNewContent = false;
    
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        hasNewContent = true;
        break;
      }
    }
    
    if (hasNewContent) {
      // Small delay to let DOM settle
      requestAnimationFrame(() => {
        processAllTweets();
      });
    }
  });

  // Observe the main content area
  // X/Twitter's main content is usually under main or the primary column
  const targetNode = document.querySelector('main') || document.body;
  
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  });

  console.log('QRart: Observer started');
}

// ============================================
// Initialization
// ============================================

async function init(): Promise<void> {
  console.log('QRart: Content script loaded');
  
  // Load configuration
  config = await loadConfig();
  
  if (!config) {
    console.log('QRart: Not configured, extension inactive');
    return;
  }
  
  console.log('QRart: Configured, watching for markers');
  
  // Process existing tweets
  processAllTweets();
  
  // Watch for new tweets
  setupObserver();
}

// Listen for config updates from options page
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && (changes.apiKey || changes.backendBaseUrl)) {
    console.log('QRart: Config changed, reloading...');
    loadConfig().then(newConfig => {
      config = newConfig;
      // Re-process page with new config
      processedTweets.delete = () => false; // Can't actually clear WeakSet
      processedMarkers.clear();
      processAllTweets();
    });
  }
});

// Start the extension
init();
