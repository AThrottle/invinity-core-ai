/**
 * Billing Client Component
 * ─────────────────────────
 * Handles all client-side billing interactions:
 * - Displays current plan and subscription status
 * - Checkout for upgrading to a paid plan
 * - Link to Stripe Customer Portal for managing subscription
 * - Post-checkout success toast
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  ExternalLink,
  Check,
  Loader2,
  Sparkles,
  Download,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: string;
  pdfUrl: string | null;
}

interface BillingClientProps {
  subscription: {
    planName: string;
    planSlug: string;
    price: number;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  plans: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stripePriceId: string | null;
    features: string[];
  }[];
  hasStripeCustomer: boolean;
  invoices?: Invoice[];
}

export function BillingClient({
  subscription,
  plans,
  hasStripeCustomer,
  invoices = [],
}: BillingClientProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);

  // Show success toast after checkout redirect
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast({
        title: "Subscription activated!",
        description: "Welcome aboard. Your plan is now active.",
        variant: "success",
      });
      // Clean the URL
      window.history.replaceState({}, "", "/dashboard/billing");
    }
  }, [searchParams, toast]);

  // Handle checkout for a plan
  async function handleCheckout(priceId: string) {
    setLoading(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create checkout session.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(null);
  }

  // Handle opening the Stripe Customer Portal
  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to open billing portal.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(null);
  }

  const statusBadge: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
    ACTIVE: { label: "Active", variant: "success" },
    TRIALING: { label: "Trial", variant: "secondary" },
    PAST_DUE: { label: "Past Due", variant: "warning" },
    CANCELED: { label: "Canceled", variant: "destructive" },
    PAUSED: { label: "Paused", variant: "secondary" },
  };

  const currentStatus = subscription
    ? statusBadge[subscription.status] || statusBadge.ACTIVE
    : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Billing</h2>
        <p className="text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                {subscription
                  ? `You are on the ${subscription.planName} plan.`
                  : "You are on the Free plan."}
              </CardDescription>
            </div>
            <Badge variant={currentStatus?.variant || "secondary"}>
              {currentStatus?.label || "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monthly cost</span>
                <span className="font-medium">
                  {formatCurrency(subscription.price)}
                </span>
              </div>
              {subscription.currentPeriodEnd && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {subscription.cancelAtPeriodEnd
                      ? "Access until"
                      : "Next billing date"}
                  </span>
                  <span>{formatDate(subscription.currentPeriodEnd)}</span>
                </div>
              )}
              {subscription.cancelAtPeriodEnd && (
                <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Your subscription is set to cancel at the end of the billing
                    period. You can reactivate in the billing portal.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-2">
            {hasStripeCustomer && (
              <Button
                variant="outline"
                onClick={handlePortal}
                disabled={loading === "portal"}
              >
                {loading === "portal" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Manage Subscription
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      {(!subscription || subscription.status === "CANCELED") && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>
              Choose a plan to unlock more features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans
                .filter((p) => p.price > 0 && p.stripePriceId)
                .map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-2xl font-bold mt-1">
                        {formatCurrency(plan.price)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /mo
                        </span>
                      </p>
                    </div>
                    <ul className="space-y-1.5">
                      {plan.features.slice(0, 4).map((f: string) => (
                        <li key={f} className="flex items-center text-sm">
                          <Check className="h-3.5 w-3.5 text-primary mr-2 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => handleCheckout(plan.stripePriceId!)}
                      disabled={loading === plan.stripePriceId}
                    >
                      {loading === plan.stripePriceId ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Subscribe
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Your past invoices and receipts.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No invoices yet. Subscribe to a paid plan to see your billing history.
            </p>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {formatCurrency(invoice.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invoice.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        invoice.status === "paid"
                          ? "success"
                          : invoice.status === "open"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {invoice.status}
                    </Badge>
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
