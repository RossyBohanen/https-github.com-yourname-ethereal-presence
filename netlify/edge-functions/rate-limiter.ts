/**
 * Rate Limiting Edge Function
 *
 * Implements sliding window rate limiting for API endpoints.
 * Uses in-memory storage for edge function lifecycle.
 * For production, integrate with Netlify KV or Upstash Redis.
 */

import type { Context, Config } from "@netlify/edge-functions";

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

// Rate limit tiers
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Unauthenticated requests
  anonymous: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  // Authenticated free tier
  free: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  // Authenticated pro tier
  pro: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
  },
  // Enterprise tier
  enterprise: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000,
  },
};

// In-memory rate limit storage (per edge function instance)
// For production, use Netlify KV or Upstash Redis
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Get rate limit key from request
 */
function getRateLimitKey(request: Request, context: Context): string {
  // Try to get user ID from auth header or cookie
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    // In production, decode JWT to get user ID
    return `user:${token.slice(0, 16)}`; // Use token prefix as identifier
  }

  // Fall back to IP-based limiting
  const ip = context.ip || "unknown";
  return `ip:${ip}`;
}

/**
 * Get rate limit tier from request
 */
function getRateLimitTier(request: Request): string {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return "anonymous";
  }

  // In production, decode JWT to get subscription tier
  // For now, default authenticated users to "free"
  const tier = request.headers.get("X-Subscription-Tier");
  if (tier && RATE_LIMITS[tier]) {
    return tier;
  }

  return "free";
}

/**
 * Check rate limit and return result
 */
function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  // If no existing record or window expired, create new window
  if (!existing || now >= existing.resetAt) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  // Check if limit exceeded
  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  // Increment count
  existing.count += 1;
  rateLimitStore.set(key, existing);

  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now >= value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

export default async (request: Request, context: Context): Promise<Response> => {
  // Skip rate limiting for non-API routes
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) {
    return context.next();
  }

  // Skip rate limiting for health checks
  if (url.pathname === "/api/health") {
    return context.next();
  }

  // Clean up expired entries occasionally
  if (Math.random() < 0.1) {
    cleanupExpiredEntries();
  }

  const key = getRateLimitKey(request, context);
  const tier = getRateLimitTier(request);
  const config = RATE_LIMITS[tier];

  const result = checkRateLimit(key, config);

  // Add rate limit headers to response
  const addRateLimitHeaders = (response: Response): Response => {
    const headers = new Headers(response.headers);
    headers.set("X-RateLimit-Limit", config.maxRequests.toString());
    headers.set("X-RateLimit-Remaining", result.remaining.toString());
    headers.set("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000).toString());
    headers.set("X-RateLimit-Tier", tier);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);

    return new Response(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(result.resetAt / 1000).toString(),
          "X-RateLimit-Tier": tier,
        },
      }
    );
  }

  // Continue to next handler and add rate limit headers to response
  const response = await context.next();
  return addRateLimitHeaders(response);
};

export const config: Config = {
  path: "/api/*",
  // Run before other edge functions
  excludedPath: ["/api/health"],
};
