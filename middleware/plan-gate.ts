/**
 * Plan Gate Middleware for API Routes
 * ─────────────────────────────────────
 * Enforces plan-level access on API endpoints.
 * Use in API route handlers to block access for users on lower plans.
 *
 * Usage:
 *   const access = await checkPlanAccess(userId, "pro");
 *   if (!access.allowed) return planGateResponse(access.requiredPlan);
 *
 * Plan hierarchy: free(0) < starter(1) < pro(2) < enterprise(3)
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ERRORS, GRACE_PERIOD_DAYS } from "@/lib/constants";

const PLAN_HIERARCHY: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

interface PlanAccessResult {
  allowed: boolean;
  currentPlan: string;
  requiredPlan: string;
}

/**
 * Check if a user has access to a feature based on their plan.
 * Includes grace period logic for past-due subscriptions.
 */
export async function checkPlanAccess(
  userId: string,
  requiredPlan: string
): Promise<PlanAccessResult> {
  const required = requiredPlan.toLowerCase();

  // Free plan always has access to free-tier features
  if (required === "free") {
    return { allowed: true, currentPlan: "free", requiredPlan: required };
  }

  // Look up the user's subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  if (!subscription) {
    return { allowed: false, currentPlan: "free", requiredPlan: required };
  }

  const currentSlug = subscription.plan.slug.toLowerCase();
  const currentLevel = PLAN_HIERARCHY[currentSlug] ?? 0;
  const requiredLevel = PLAN_HIERARCHY[required] ?? 0;

  // Active or trialing subscription — check plan level
  if (
    subscription.status === "ACTIVE" ||
    subscription.status === "TRIALING"
  ) {
    return {
      allowed: currentLevel >= requiredLevel,
      currentPlan: currentSlug,
      requiredPlan: required,
    };
  }

  // Past due — allow access during grace period
  if (subscription.status === "PAST_DUE" && subscription.currentPeriodEnd) {
    const graceEnd = new Date(subscription.currentPeriodEnd);
    graceEnd.setDate(graceEnd.getDate() + GRACE_PERIOD_DAYS);

    if (new Date() <= graceEnd) {
      return {
        allowed: currentLevel >= requiredLevel,
        currentPlan: currentSlug,
        requiredPlan: required,
      };
    }
  }

  // Canceled, paused, or grace period expired
  return { allowed: false, currentPlan: currentSlug, requiredPlan: required };
}

export function planGateResponse(requiredPlan: string) {
  return NextResponse.json(
    {
      error: ERRORS.SUBSCRIPTION_REQUIRED,
      requiredPlan,
      upgradeUrl: "/dashboard/billing",
    },
    { status: 403 }
  );
}
