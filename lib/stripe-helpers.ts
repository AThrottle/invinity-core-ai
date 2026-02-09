/**
 * Stripe Helper Functions
 * ────────────────────────
 * Business logic for Stripe operations: creating/retrieving customers,
 * creating checkout sessions, and managing subscriptions.
 *
 * These are extracted from the API routes to keep route handlers thin
 * and make the logic testable and reusable.
 */

import { getStripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

/**
 * Get or create a Stripe Customer for a user.
 * Stores the stripeCustomerId on the User record for future lookups.
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const stripe = getStripe();

  // Check if user already has a Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, email: true, name: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Return existing customer ID
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create a new Stripe Customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: {
      userId: userId,
    },
  });

  // Save the customer ID to our database
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Create a Stripe Checkout Session for subscribing to a plan.
 * Returns the checkout URL to redirect the user to.
 */
export async function createCheckoutSession({
  userId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const stripe = getStripe();

  // Get or create the Stripe customer
  const customerId = await getOrCreateStripeCustomer(userId);

  // Check if user already has an active subscription
  const existingSub = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (existingSub && existingSub.status === "ACTIVE") {
    throw new Error("User already has an active subscription. Use the billing portal to change plans.");
  }

  // Create the checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        userId: userId,
      },
    },
    metadata: {
      userId: userId,
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL");
  }

  return session.url;
}

/**
 * Create a Stripe Customer Portal session.
 * Returns the portal URL for managing subscriptions and billing.
 */
export async function createPortalSession({
  userId,
  returnUrl,
}: {
  userId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  const customerId = await getOrCreateStripeCustomer(userId);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Sync a Stripe Subscription to our database.
 * Called from webhook handlers when subscription events occur.
 */
export async function syncSubscription(
  stripeSubscription: {
    id: string;
    status: string;
    customer: string | { id: string };
    items: { data: Array<{ price: { id: string } }> };
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
    trial_end: number | null;
    metadata: { userId?: string };
  }
) {
  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer.id;

  // Find user by Stripe customer ID or metadata
  let userId = stripeSubscription.metadata?.userId;

  if (!userId) {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    });
    if (!user) {
      console.error(`No user found for Stripe customer: ${customerId}`);
      return;
    }
    userId = user.id;
  }

  // Find the plan by Stripe price ID
  const stripePriceId = stripeSubscription.items.data[0]?.price.id;
  const plan = await prisma.plan.findFirst({
    where: { stripePriceId },
    select: { id: true },
  });

  if (!plan) {
    console.error(`No plan found for Stripe price: ${stripePriceId}`);
    return;
  }

  // Map Stripe status to our enum
  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    trialing: "TRIALING",
    paused: "PAUSED",
    incomplete: "PAST_DUE",
    incomplete_expired: "CANCELED",
    unpaid: "PAST_DUE",
  };

  const status = statusMap[stripeSubscription.status] || "ACTIVE";

  // Upsert the subscription record
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      planId: plan.id,
      stripeSubId: stripeSubscription.id,
      status: status as any,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
    },
    create: {
      userId,
      planId: plan.id,
      stripeSubId: stripeSubscription.id,
      status: status as any,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
    },
  });
}

/**
 * Cancel a subscription in our database.
 * Called when Stripe sends customer.subscription.deleted.
 */
export async function cancelSubscription(stripeSubId: string) {
  await prisma.subscription.updateMany({
    where: { stripeSubId },
    data: { status: "CANCELED", cancelAtPeriodEnd: false },
  });
}

/**
 * Reset API usage counters for a user.
 * Called at the start of a new billing period (invoice.payment_succeeded).
 */
export async function resetUsageCounters(userId: string) {
  const now = new Date();
  await prisma.apiUsage.updateMany({
    where: {
      userId,
      periodEnd: { lte: now },
    },
    data: { count: 0 },
  });
}
