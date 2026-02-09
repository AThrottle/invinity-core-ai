/**
 * Global Loading UI
 * ──────────────────
 * Shown during page transitions and data fetching.
 * Uses Next.js Suspense boundaries automatically.
 */

import { Infinity } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Infinity className="h-8 w-8 text-primary animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
