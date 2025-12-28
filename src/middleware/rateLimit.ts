import { Request, Response, NextFunction } from 'express';

/**
 * Simple In-Memory Rate Limiter
 * 
 * For MVP, this uses an in-memory store which resets on server restart.
 * This is fine for development and small-scale production.
 * 
 * For production at scale, consider:
 * - Redis-backed rate limiting (express-rate-limit + rate-limit-redis)
 * - Per-API-key rate limits
 * - Different limits for different endpoints
 * - Sliding window algorithm
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration from environment or defaults
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 minute
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

/**
 * Get client identifier for rate limiting
 * Uses IP address, falling back to a default for development
 */
function getClientId(req: Request): string {
  // In production behind a proxy, use X-Forwarded-For
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ip.trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Clean up expired entries periodically
 */
function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpired, 60000);

/**
 * Rate limiting middleware
 * Limits requests per IP address within a time window
 */
export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const clientId = getClientId(req);
  const now = Date.now();

  let entry = rateLimitStore.get(clientId);

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    rateLimitStore.set(clientId, entry);
  } else {
    entry.count++;
  }

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS.toString());
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());

  // Check if over limit
  if (entry.count > MAX_REQUESTS) {
    res.status(429).json({
      error: 'too_many_requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    });
    return;
  }

  next();
}

/**
 * Create a rate limiter with custom settings
 */
export function createRateLimiter(options: {
  windowMs?: number;
  maxRequests?: number;
}) {
  const windowMs = options.windowMs || WINDOW_MS;
  const maxRequests = options.maxRequests || MAX_REQUESTS;
  const store = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = getClientId(req);
    const now = Date.now();

    let entry = store.get(clientId);

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      store.set(clientId, entry);
    } else {
      entry.count++;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());

    if (entry.count > maxRequests) {
      res.status(429).json({
        error: 'too_many_requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}
