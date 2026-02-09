/**
 * Rate Limiting Middleware
 * ────────────────────────
 * Simple in-memory rate limiter for API routes.
 * Will be production-hardened in Phase 7.
 */

import { NextResponse } from "next/server";
import { RATE_LIMITS, ERRORS } from "@/lib/constants";

// In-memory store (replace with Redis in production)
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();

interface RateLimitConfig {
  requests: number;
  window: number; // seconds
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.window * 1000,
    });
    return {
      allowed: true,
      remaining: config.requests - 1,
      resetIn: config.window,
    };
  }

  if (entry.count >= config.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.requests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

export function rateLimitResponse(resetIn: number) {
  return NextResponse.json(
    { error: ERRORS.RATE_LIMITED },
    {
      status: 429,
      headers: {
        "Retry-After": String(resetIn),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}
