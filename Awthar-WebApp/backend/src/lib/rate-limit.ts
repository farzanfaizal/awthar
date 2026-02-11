import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

// In-memory store for rate limiting (resets on cold start — acceptable for Vercel serverless)
const store = new Map<string, { count: number; resetTime: number }>();

// Cleanup stale entries periodically
function cleanup() {
  const now = Date.now();
  for (const [key, value] of store) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}

// Run cleanup every 60s
if (typeof setInterval !== "undefined") {
  setInterval(cleanup, 60_000);
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return null;
  }

  if (entry.count >= config.maxRequests) {
    return NextResponse.json(
      { error: { message: config.message, code: "RATE_LIMITED", statusCode: 429 } },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((entry.resetTime - now) / 1000).toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(entry.resetTime / 1000).toString(),
        },
      }
    );
  }

  entry.count++;
  return null;
}

// Pre-configured limiters
export const RATE_LIMITS = {
  writeOperations: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 20,
    message: "Too many requests, please try again later",
  },
  upload: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: "Too many file uploads, please try again later",
  },
  review: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: "Too many reviews submitted, please try again later",
  },
  booking: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    message: "Too many booking requests, please try again later",
  },
  message: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: "Too many messages sent, please slow down",
  },
} as const;
