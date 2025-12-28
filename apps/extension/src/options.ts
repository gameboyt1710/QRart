/**
 * QRart Extension - Options Page Script
 * 
 * Handles saving and loading user configuration for the extension.
 * Settings are stored in chrome.storage.sync so they persist across devices.
 */

interface ExtensionConfig {
  apiKey: string;
  backendBaseUrl: string;
}

const DEFAULT_BACKEND_URL = 'http://localhost:4000';

// DOM elements
const backendUrlInput = document.getElementById('backendUrl') as HTMLInputElement;
const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const messageEl = document.getElementById('message') as HTMLDivElement;
const statusEl = document.getElementById('statusValue') as HTMLDivElement;

/**
 * Load saved configuration from storage
 */
async function loadConfig(): Promise<void> {
  try {
    const result = await chrome.storage.sync.get(['apiKey', 'backendBaseUrl']);
    
    if (result.backendBaseUrl) {
      backendUrlInput.value = result.backendBaseUrl;
    } else {
      backendUrlInput.value = DEFAULT_BACKEND_URL;
    }
    
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
    
    updateStatus(result as ExtensionConfig);
  } catch (error) {
    console.error('Failed to load config:', error);
    showMessage('Failed to load settings', 'error');
  }
}

/**
 * Save configuration to storage
 */
async function saveConfig(): Promise<void> {
  const backendBaseUrl = backendUrlInput.value.trim().replace(/\/$/, ''); // Remove trailing slash
  const apiKey = apiKeyInput.value.trim();
  
  if (!backendBaseUrl) {
    showMessage('Please enter a backend URL', 'error');
    return;
  }
  
  if (!apiKey) {
    showMessage('Please enter an API key', 'error');
    return;
  }
  
  // Validate URL format
  try {
    new URL(backendBaseUrl);
  } catch {
    showMessage('Invalid backend URL format', 'error');
    return;
  }
  
  try {
    await chrome.storage.sync.set({ apiKey, backendBaseUrl });
    showMessage('Settings saved! Refresh X/Twitter to apply.', 'success');
    updateStatus({ apiKey, backendBaseUrl });
    
    // Notify content scripts of config change
    chrome.runtime.sendMessage({ type: 'CONFIG_UPDATED' });
  } catch (error) {
    console.error('Failed to save config:', error);
    showMessage('Failed to save settings', 'error');
  }
}

/**
 * Show a temporary message
 */
function showMessage(text: string, type: 'success' | 'error'): void {
  messageEl.textContent = text;
  messageEl.className = `message message-${type}`;
  messageEl.style.display = 'block';
  
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 3000);
}

/**
 * Update the status display
 */
function updateStatus(config: Partial<ExtensionConfig>): void {
  if (config.apiKey && config.backendBaseUrl) {
    statusEl.textContent = `✓ Configured - ${config.backendBaseUrl}`;
    statusEl.className = 'status-value configured';
  } else if (config.backendBaseUrl) {
    statusEl.textContent = 'API key not set';
    statusEl.className = 'status-value not-configured';
  } else {
    statusEl.textContent = 'Not configured';
    statusEl.className = 'status-value not-configured';
  }
}

// Event listeners
saveBtn.addEventListener('click', saveConfig);

// Save on Enter key
apiKeyInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveConfig();
  }
});

backendUrlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveConfig();
  }
});

// Load config on page load
loadConfig();
