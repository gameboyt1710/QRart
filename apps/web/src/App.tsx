import { useState, useRef, useCallback } from 'react';
import QRCode from 'qrcode';

// API base URL - in production, set VITE_API_BASE_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface UploadResult {
  id: string;
  shortId: string;
  marker: string;
}

function App() {
  // Form state
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('qrart_api_key') || '';
  });
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save API key to localStorage when it changes
  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem('qrart_api_key', value);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);
    setQrDataUrl(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Generate QR code for the marker
  const generateQR = async (marker: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(marker, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1a1a2e',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  // Upload artwork
  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image file');
      return;
    }
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    setIsUploading(true);
    setError(null);
    setCopied(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title.trim()) {
        formData.append('title', title.trim());
      }

      const response = await fetch(`${API_BASE_URL}/api/artworks`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Upload failed: ${response.status}`);
      }

      const data: UploadResult = await response.json();
      setResult(data);
      
      // Generate QR code for the marker
      await generateQR(data.marker);

      // Clear form for next upload
      setTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Copy marker to clipboard
  const copyMarker = useCallback(async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result.marker);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = result.marker;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  // Download QR code
  const downloadQR = useCallback(() => {
    if (!qrDataUrl || !result) return;
    
    const link = document.createElement('a');
    link.download = `qrart-${result.shortId}.png`;
    link.href = qrDataUrl;
    link.click();
  }, [qrDataUrl, result]);

  // Reset form
  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setTitle('');
    setResult(null);
    setQrDataUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎨 QRart</h1>
        <p>Encode your art. Keep control.</p>
      </header>

      {/* API Key Section */}
      <div className="card">
        <h2>🔑 API Key</h2>
        <div className="form-group">
          <label htmlFor="apiKey">Your API Key</label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="Enter your API key"
          />
        </div>
      </div>

      {/* Upload Section */}
      <div className="card">
        <h2>📤 Upload Artwork</h2>

        {error && (
          <div className="message message-error">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">Title (optional)</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My amazing artwork"
          />
        </div>

        <div className="form-group">
          <label>Image File</label>
          <div className="file-input-wrapper">
            <input
              type="file"
              ref={fileInputRef}
              className="file-input"
              id="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
            />
            <label 
              htmlFor="file" 
              className={`file-label ${file ? 'has-file' : ''}`}
            >
              <span className="file-label-icon">
                {file ? '✅' : '🖼️'}
              </span>
              <span className="file-label-text">
                {file ? 'File selected' : 'Click or drag to select an image'}
              </span>
              {file && (
                <span className="file-label-name">{file.name}</span>
              )}
            </label>
          </div>

          {preview && (
            <div className="preview-wrapper">
              <img src={preview} alt="Preview" className="preview-image" />
            </div>
          )}
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleUpload}
          disabled={isUploading || !file}
        >
          {isUploading ? (
            <span className="loading">
              <span className="spinner"></span>
              Uploading...
            </span>
          ) : (
            '🚀 Upload & Get Marker'
          )}
        </button>
      </div>

      {/* Result Section */}
      {result && (
        <div className="card">
          <h2>✨ Success!</h2>
          <div className="message message-success">
            Your artwork has been uploaded and encoded!
          </div>

          <div className="result">
            <div className="result-label">Your Marker:</div>
            <div className="marker-display">{result.marker}</div>
            <div className="result-actions">
              <button className="btn btn-primary" onClick={copyMarker}>
                {copied ? '✓ Copied!' : '📋 Copy Marker'}
              </button>
              <button className="btn btn-secondary" onClick={resetForm}>
                Upload Another
              </button>
            </div>
          </div>

          {qrDataUrl && (
            <div className="qr-section">
              <div className="result-label">Or use this QR code:</div>
              <div className="qr-code">
                <img src={qrDataUrl} alt="QR Code" />
              </div>
              <button className="btn btn-secondary" onClick={downloadQR}>
                💾 Download QR
              </button>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="info-section">
        <h3>📖 How to use</h3>
        <ol>
          <li>Enter your API key (get one from the platform admin)</li>
          <li>Select an image to upload</li>
          <li>Click "Upload & Get Marker"</li>
          <li>Copy the marker (e.g., <code>~ART:4F9A21~</code>)</li>
          <li>Paste it into your X/Twitter post</li>
          <li>Users with the browser extension will see your art!</li>
        </ol>
      </div>

      <div className="info-section">
        <h3>🔌 Browser Extension</h3>
        <ol>
          <li>Download the extension from the releases page</li>
          <li>Install in Chrome: <code>chrome://extensions</code> → "Load unpacked"</li>
          <li>Click the extension icon → enter your API key</li>
          <li>Visit X/Twitter to see encoded art revealed!</li>
        </ol>
      </div>

      <footer className="footer">
        <p>
          QRart • <a href="/terms" target="_blank">Terms of Service</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
