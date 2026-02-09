/**
 * Stripe Checkout Session API
 * ────────────────────────────
 * POST /api/stripe/checkout
 * Body: { priceId: string }
 *
 * Creates a Stripe Checkout Session for the authenticated user.
 * Returns a redirect URL to the Stripe-hosted checkout page.
 *
 * Flow:
 * 1. User clicks "Subscribe" on pricing page
 * 2. Frontend POSTs priceId to this endpoint
 * 3. We create/retrieve a Stripe Customer for the user
 * 4. We create a Checkout Session with the selected price
 * 5. We return the checkout URL
 * 6. Frontend redirects user to Stripe checkout
 * 7. After payment, Stripe redirects back to our success URL
 * 8. Webhook handles subscription creation in the background
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createCheckoutSession } from "@/lib/stripe-helpers";

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to subscribe." },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: "priceId is required." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create the checkout session
    const checkoutUrl = await createCheckoutSession({
      userId: session.id,
      priceId,
      successUrl: `${appUrl}/dashboard/billing?checkout=success`,
      cancelUrl: `${appUrl}/pricing?checkout=canceled`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
