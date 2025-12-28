/**
 * Shared types for QRart platform
 * Used by backend, web UI, and browser extension
 */

// ============================================
// API Response Types
// ============================================

export interface UploadArtworkResponse {
  id: string;
  shortId: string;
  marker: string;
}

export interface ArtworkMetadata {
  shortId: string;
  title: string | null;
  mimeType: string;
  dataUrl?: string;   // Base64 data URL (for small images or when requested)
  imageUrl?: string;  // Direct URL to fetch image
}

export interface ApiError {
  error: string;
  message: string;
}

// ============================================
// Marker Constants
// ============================================

/**
 * The marker format used to identify artworks in tweets
 * Format: ~ART:<shortId>~
 * Example: ~ART:4F9A21~
 */
export const MARKER_PREFIX = '~ART:';
export const MARKER_SUFFIX = '~';

/**
 * Regex to match markers in text
 * Captures the shortId in group 1
 */
export const MARKER_REGEX = /~ART:([A-Za-z0-9_-]{4,20})~/g;

/**
 * Create a marker string from a shortId
 */
export function createMarker(shortId: string): string {
  return `${MARKER_PREFIX}${shortId}${MARKER_SUFFIX}`;
}

/**
 * Extract shortIds from text containing markers
 */
export function extractShortIds(text: string): string[] {
  const matches = text.matchAll(MARKER_REGEX);
  return [...matches].map(m => m[1]);
}

// ============================================
// Extension Storage Types
// ============================================

export interface ExtensionConfig {
  apiKey: string;
  backendBaseUrl: string;
}

// ============================================
// API Headers
// ============================================

export const API_KEY_HEADER = 'x-api-key';
