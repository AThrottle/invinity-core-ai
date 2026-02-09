/**
 * Auth Middleware for API Routes
 * ───────────────────────────────
 * Verifies authentication on API endpoints.
 * Will be fully implemented in Phase 2.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>
) {
  // Phase 2: Verify session and extract userId
  // For now, return unauthorized
  return NextResponse.json(
    { error: "Authentication required" },
    { status: 401 }
  );
}
