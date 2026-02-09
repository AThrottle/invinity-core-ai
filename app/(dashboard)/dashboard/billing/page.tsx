/**
 * Billing Page
 * ─────────────
 * Server component that fetches:
 * - User's subscription + plan details from DB
 * - Invoice history from Stripe API
 * - All active plans for upgrade CTAs
 *
 * Passes everything to the BillingClient for rendering.
 */

import { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { BillingClient } from "@/components/dashboard/billing-client";

export const metadata: Metadata = {
  title: "Billing",
};

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: string;
  pdfUrl: string | null;
}

async function getInvoices(stripeCustomerId: string | null): Promise<Invoice[]> {
  if (!stripeCustomerId || !process.env.STRIPE_SECRET_KEY) return [];

  try {
    const { getStripe } = await import("@/lib/stripe");
    const stripe = getStripe();

    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 10,
    });

    return invoices.data.map((inv) => ({
      id: inv.id,
      date: new Date(inv.created * 1000).toISOString(),
      amount: inv.amount_paid || 0,
      status: inv.status || "unknown",
      pdfUrl: inv.invoice_pdf || null,
    }));
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return [];
  }
}

export default async function BillingPage() {
  const user = await requireAuth();

  // Fetch subscription with plan details
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    include: { plan: true },
  });

  // Fetch all active plans for the upgrade CTA
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  // Fetch invoice history from Stripe
  const invoices = await getInvoices(user.stripeCustomerId);

  return (
    <BillingClient
      subscription={
        subscription
          ? {
              planName: subscription.plan.name,
              planSlug: subscription.plan.slug,
              price: subscription.plan.price,
              status: subscription.status,
              currentPeriodEnd:
                subscription.currentPeriodEnd?.toISOString() || null,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            }
          : null
      }
      plans={plans.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        stripePriceId: p.stripePriceId,
        features: JSON.parse(p.features as string),
      }))}
      hasStripeCustomer={!!user.stripeCustomerId}
      invoices={invoices}
    />
  );
}
