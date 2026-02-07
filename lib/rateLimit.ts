/**
 * Simple In-Memory Rate Limiter for API Routes
 *
 * Per-IP rate limiting with configurable window + max requests.
 * In serverless/edge, each instance has its own store (intentional—
 * prevents memory leaks, and cloud auto-scaling provides natural sharding).
 *
 * Usage in API routes:
 *   import { rateLimit } from '@/lib/rateLimit';
 *   const limiter = rateLimit({ windowMs: 60_000, max: 30 });
 *
 *   export async function POST(request: NextRequest) {
 *     const limited = limiter(request);
 *     if (limited) return limited;
 *     // ... normal logic
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [ip: string]: { count: number; resetAt: number };
}

interface RateLimitOptions {
  /** Time window in milliseconds (default: 60000 = 1 minute) */
  windowMs?: number;
  /** Max requests per window (default: 30) */
  max?: number;
  /** Message returned when rate limited */
  message?: string;
}

/**
 * Create a rate limiter function.
 * Returns null if allowed, or a 429 NextResponse if rate limited.
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 60_000,
    max = 30,
    message = 'Too many requests. Please try again later.',
  } = options;

  const store: RateLimitStore = {};

  // Periodic cleanup to prevent unbounded memory growth
  let lastCleanup = Date.now();
  const CLEANUP_INTERVAL = 5 * 60_000; // 5 minutes

  function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const ip of Object.keys(store)) {
      if (store[ip].resetAt < now) {
        delete store[ip];
      }
    }
  }

  return function checkRateLimit(request: NextRequest): NextResponse | null {
    cleanup();

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const now = Date.now();
    const record = store[ip];

    if (!record || record.resetAt < now) {
      // New window
      store[ip] = { count: 1, resetAt: now + windowMs };
      return null;
    }

    record.count++;

    if (record.count > max) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      return NextResponse.json(
        { error: message },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(record.resetAt),
          },
        }
      );
    }

    return null;
  };
}

/** Pre-configured limiter for payment endpoints (stricter) */
export const paymentLimiter = rateLimit({ windowMs: 60_000, max: 10 });

/** Pre-configured limiter for standard API endpoints */
export const standardLimiter = rateLimit({ windowMs: 60_000, max: 30 });

/** Pre-configured limiter for public search endpoints */
export const searchLimiter = rateLimit({ windowMs: 60_000, max: 60 });
