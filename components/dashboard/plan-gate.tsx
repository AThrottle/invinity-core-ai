/**
 * PlanGate Component
 * ───────────────────
 * Wraps features that require a specific plan.
 * Shows the feature if the user's plan meets the requirement,
 * or shows an upgrade prompt if it doesn't.
 *
 * Usage:
 *   <PlanGate requiredPlan="pro" currentPlan="free">
 *     <AIWriter />
 *   </PlanGate>
 *
 * Plan hierarchy: free < starter < pro < enterprise
 */

"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

/** Plan hierarchy — higher index = higher tier */
const PLAN_HIERARCHY = ["free", "starter", "pro", "enterprise"];

interface PlanGateProps {
  /** The minimum plan required to access this feature */
  requiredPlan: string;
  /** The user's current plan slug (pass "free" if no subscription) */
  currentPlan: string;
  /** The feature name to display in the upgrade prompt */
  featureName?: string;
  /** The content to render if the user has access */
  children: React.ReactNode;
}

export function PlanGate({
  requiredPlan,
  currentPlan,
  featureName = "This feature",
  children,
}: PlanGateProps) {
  const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan.toLowerCase());
  const requiredIndex = PLAN_HIERARCHY.indexOf(requiredPlan.toLowerCase());

  // User has access — render the feature
  if (currentIndex >= requiredIndex) {
    return <>{children}</>;
  }

  // User doesn't have access — show upgrade prompt
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">
          {featureName} requires the{" "}
          <span className="capitalize text-primary">{requiredPlan}</span> plan
        </CardTitle>
        <CardDescription>
          Upgrade your plan to unlock this feature and more.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Link href={ROUTES.BILLING}>
          <Button>Upgrade Plan</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
