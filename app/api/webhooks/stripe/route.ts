/**
 * Stripe Webhook Handler
 * ───────────────────────
 * POST /api/webhooks/stripe
 *
 * Processes real-time Stripe events to keep our database in sync.
 * This is the single source of truth for subscription state.
 *
 * Handled events:
 * ┌─────────────────────────────────────┬───────────────────────────────────────┐
 * │ Event                               │ Action                                │
 * ├─────────────────────────────────────┼───────────────────────────────────────┤
 * │ checkout.session.completed          │ Create subscription, link user→plan   │
 * │ customer.subscription.updated       │ Update status, plan, billing period   │
 * │ customer.subscription.deleted       │ Set status to CANCELED                │
 * │ invoice.payment_succeeded           │ Update billing period, reset usage    │
 * │ invoice.payment_failed              │ Set status to PAST_DUE               │
 * │ customer.subscription.trial_will_end│ (Log — email handled by Stripe)       │
 * └─────────────────────────────────────┴───────────────────────────────────────┘
 *
 * Security: Every request is verified using the Stripe webhook signing secret.
 * If verification fails, the request is rejected with 400.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  syncSubscription,
  cancelSubscription,
  resetUsageCounters,
} from "@/lib/stripe-helpers";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // ── Verify Webhook Signature ─────────────
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // ── Handle Events ────────────────────────
  try {
    switch (event.type) {
      // ── Checkout Completed ───────────────
      // User completed the Stripe Checkout — create their subscription
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          // Fetch the full subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await syncSubscription(subscription as any);
          console.log(`✓ Checkout completed for customer: ${session.customer}`);
        }
        break;
      }

      // ── Subscription Updated ─────────────
      // Plan change, status change, or billing period update
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription as any);
        console.log(`✓ Subscription updated: ${subscription.id}`);
        break;
      }

      // ── Subscription Deleted ─────────────
      // Subscription fully canceled (no more access)
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await cancelSubscription(subscription.id);
        console.log(`✓ Subscription canceled: ${subscription.id}`);
        break;
      }

      // ── Invoice Payment Succeeded ────────
      // New billing period started — reset usage counters
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceSubId = (invoice as any).subscription as string | null;

        if (invoiceSubId) {
          // Find the user by customer ID
          const customerId =
            typeof invoice.customer === "string"
              ? invoice.customer
              : invoice.customer?.id;

          if (customerId) {
            const user = await prisma.user.findFirst({
              where: { stripeCustomerId: customerId },
              select: { id: true },
            });

            if (user) {
              await resetUsageCounters(user.id);
              console.log(`✓ Usage reset for user: ${user.id}`);
            }
          }
        }
        break;
      }

      // ── Invoice Payment Failed ───────────
      // Payment failed — subscription enters dunning
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceSubId = (invoice as any).subscription as string | null;

        if (invoiceSubId) {
          await prisma.subscription.updateMany({
            where: { stripeSubId: invoiceSubId },
            data: { status: "PAST_DUE" },
          });
          console.log(`✓ Subscription past due: ${invoiceSubId}`);
        }
        break;
      }

      // ── Trial Ending ─────────────────────
      // 3 days before trial ends — log for awareness
      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`ℹ Trial ending soon for subscription: ${subscription.id}`);
        // Optional: Send a trial-ending email via Resend here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error(`Error processing webhook ${event.type}:`, error);
    // Return 200 anyway to prevent Stripe from retrying
    // Log the error for debugging
  }

  return NextResponse.json({ received: true });
}
