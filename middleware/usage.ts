/**
 * Usage Metering Middleware
 * ─────────────────────────
 * Tracks API usage per user per endpoint.
 * Enforces plan limits on API calls.
 *
 * Usage in API route handlers:
 *   const usage = await checkAndIncrementUsage(userId, "/api/ai/generate");
 *   if (!usage.allowed) return usageLimitResponse(usage);
 *
 * Usage counters are reset at the start of each billing period
 * via the invoice.payment_succeeded webhook handler.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ERRORS } from "@/lib/constants";

interface UsageResult {
  allowed: boolean;
  current: number;
  limit: number;
  endpoint: string;
}

/**
 * Check usage and increment the counter atomically.
 * Returns whether the request is allowed based on plan limits.
 */
export async function checkAndIncrementUsage(
  userId: string,
  endpoint: string
): Promise<UsageResult> {
  // Get the user's subscription and plan limits
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  // No subscription = free tier limits
  const limits = subscription
    ? JSON.parse(subscription.plan.limits as string)
    : { apiCalls: 100 };

  const limit = limits.apiCalls ?? 100;

  // Unlimited access (-1 means unlimited)
  if (limit === -1) {
    await incrementCounter(userId, endpoint);
    return { allowed: true, current: 0, limit: -1, endpoint };
  }

  // Get or create the usage record for this billing period
  const now = new Date();
  const periodStart = subscription?.currentPeriodStart || startOfMonth(now);
  const periodEnd = subscription?.currentPeriodEnd || endOfMonth(now);

  const usage = await prisma.apiUsage.upsert({
    where: {
      userId_endpoint_periodStart: {
        userId,
        endpoint,
        periodStart,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      endpoint,
      count: 1,
      periodStart,
      periodEnd,
    },
  });

  const allowed = usage.count <= limit;

  return {
    allowed,
    current: usage.count,
    limit,
    endpoint,
  };
}

/**
 * Increment a usage counter without checking limits.
 * Used for unlimited plans where we still want to track usage.
 */
async function incrementCounter(userId: string, endpoint: string) {
  const now = new Date();
  const periodStart = startOfMonth(now);
  const periodEnd = endOfMonth(now);

  await prisma.apiUsage.upsert({
    where: {
      userId_endpoint_periodStart: {
        userId,
        endpoint,
        periodStart,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      endpoint,
      count: 1,
      periodStart,
      periodEnd,
    },
  });
}

/** Get start of current month */
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Get end of current month */
function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

/**
 * Return a 429 response when usage limit is exceeded.
 */
export function usageLimitResponse(usage: UsageResult) {
  return NextResponse.json(
    {
      error: ERRORS.PLAN_LIMIT_REACHED,
      usage: {
        current: usage.current,
        limit: usage.limit,
        endpoint: usage.endpoint,
      },
      upgradeUrl: "/dashboard/billing",
    },
    { status: 429 }
  );
}
