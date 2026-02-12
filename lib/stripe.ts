/**
 * Stripe Client Initialization
 * ─────────────────────────────
 * Server-side Stripe instance. Lazy-initialized to avoid
 * crashing during setup when STRIPE_SECRET_KEY isn't configured yet.
 *
 * Usage:
 *   import { getStripe } from "@/lib/stripe";
 *   const stripe = getStripe();
 *   const session = await stripe.checkout.sessions.create({...});
 */

import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Get the Stripe client instance.
 * Throws a clear error if STRIPE_SECRET_KEY is not set.
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Complete the setup wizard at /setup."
      );
    }

    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }

  return stripeInstance;
}

export default getStripe;
