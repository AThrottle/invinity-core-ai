/**
 * Stripe Customer Portal API
 * ────────────────────────────
 * POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session for the authenticated user.
 * The portal lets customers manage their subscription, update payment
 * methods, view invoices, and cancel/downgrade.
 *
 * Returns a redirect URL to the Stripe-hosted portal.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createPortalSession } from "@/lib/stripe-helpers";

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create the portal session
    const portalUrl = await createPortalSession({
      userId: session.id,
      returnUrl: `${appUrl}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalUrl });
  } catch (error: any) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session." },
      { status: 500 }
    );
  }
}
