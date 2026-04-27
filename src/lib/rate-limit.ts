import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * In-memory rate limiter using a Map.
 * Suitable for single-instance dev/MVP. Swap to Redis for multi-instance prod.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const store = new Map<string, RateLimitEntry>();
  const { windowMs, maxRequests, keyGenerator } = options;

  // Periodic cleanup to prevent memory leak
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, windowMs * 2);

  // Allow GC to clean up if the module is unloaded
  if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
  }

  return async function checkRateLimit(
    request: NextRequest
  ): Promise<NextResponse | null> {
    const key =
      keyGenerator?.(request) ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return null; // allowed
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(entry.resetAt),
          },
        }
      );
    }

    return null; // allowed
  };
}

// ── Pre-configured limiters ────��───────────────────────────────────────

/** General API: 100 requests per minute per IP */
export const apiRateLimit = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 100,
});

/** Auth endpoints: 10 requests per minute per IP */
export const authRateLimit = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 10,
});

/** Nudge actions: 20 requests per minute per IP */
export const nudgeRateLimit = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
});
