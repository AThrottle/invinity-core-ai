/**
 * Pricing Page
 * ─────────────
 * Full pricing page with:
 * - Dynamic plan cards from database
 * - Feature comparison table
 * - Pricing-specific FAQ
 * - CTA at the bottom
 *
 * Plans are fetched server-side from the database.
 * Checkout integration via PricingButton (client component).
 */

import { Metadata } from "next";
import Link from "next/link";
import { Check, X, HelpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PricingButton } from "@/components/marketing/pricing-button";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the plan that fits your needs. Start free, upgrade anytime.",
};

/**
 * Feature comparison rows.
 * Each row maps a feature to availability per plan slug.
 * true = included, false = not included, string = specific limit.
 */
const comparisonFeatures = [
  { name: "Projects", free: "1", starter: "5", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "API Calls / month", free: "100", starter: "1,000", pro: "10,000", enterprise: "Unlimited" },
  { name: "Storage", free: "100 MB", starter: "1 GB", pro: "10 GB", enterprise: "Unlimited" },
  { name: "Custom Domain", free: false, starter: true, pro: true, enterprise: true },
  { name: "Email Support", free: false, starter: true, pro: true, enterprise: true },
  { name: "Priority Support", free: false, starter: false, pro: true, enterprise: true },
  { name: "API Access", free: false, starter: false, pro: true, enterprise: true },
  { name: "Team Collaboration", free: false, starter: false, pro: true, enterprise: true },
  { name: "Custom Integrations", free: false, starter: false, pro: false, enterprise: true },
  { name: "SLA Guarantee", free: false, starter: false, pro: false, enterprise: true },
  { name: "White-label", free: false, starter: false, pro: false, enterprise: true },
];

const pricingFAQ = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes. Upgrade or downgrade at any time from your billing dashboard. Changes take effect immediately, and you'll be prorated.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards via Stripe, as well as Apple Pay and Google Pay where available.",
  },
  {
    q: "Is there a free trial?",
    a: "The Free plan lets you explore the product at no cost. Paid plans come with a 14-day money-back guarantee.",
  },
  {
    q: "What happens if I cancel?",
    a: "You keep access until the end of your billing period. After that, your account reverts to the Free plan. No data is deleted.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Annual plans with a discount are coming soon. Currently all plans are billed monthly.",
  },
];

export default async function PricingPage() {
  let plans: any[] = [];
  try {
    plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    // DB not connected
  }

  const popularSlug = "pro";

  return (
    <>
      {/* Header */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when you need more power. No surprises.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const features = JSON.parse(plan.features as string) as string[];
              const isPopular = plan.slug === popularSlug;

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${
                    isPopular ? "border-primary shadow-lg md:scale-105 z-10" : ""
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      {plan.slug === "free" && "Get started for free"}
                      {plan.slug === "starter" && "For growing projects"}
                      {plan.slug === "pro" && "For serious builders"}
                      {plan.slug === "enterprise" && "For large-scale operations"}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {plan.price === 0 ? "$0" : formatCurrency(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {features.map((feature: string) => (
                        <li key={feature} className="flex items-start">
                          <Check className="h-4 w-4 text-primary mt-0.5 mr-3 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <PricingButton
                      planSlug={plan.slug}
                      stripePriceId={plan.stripePriceId}
                      price={plan.price}
                      isPopular={isPopular}
                    />
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Compare plans
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See exactly what each plan includes.
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-medium w-1/3">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">Free</th>
                  <th className="text-center py-3 px-4 font-medium">Starter</th>
                  <th className="text-center py-3 px-4 font-medium text-primary">Pro</th>
                  <th className="text-center py-3 px-4 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
                  <tr key={row.name} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-muted-foreground">{row.name}</td>
                    {(["free", "starter", "pro", "enterprise"] as const).map((slug) => {
                      const val = row[slug];
                      return (
                        <td key={slug} className="text-center py-3 px-4">
                          {val === true ? (
                            <Check className="h-4 w-4 text-primary mx-auto" />
                          ) : val === false ? (
                            <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          ) : (
                            <span className="font-medium text-xs">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pricing FAQ
            </h2>
          </div>

          <div className="mx-auto max-w-2xl space-y-6">
            {pricingFAQ.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <h3 className="font-medium">{item.q}</h3>
                </div>
                <p className="text-sm text-muted-foreground pl-7">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of builders shipping faster with Infinity Core.
          </p>
          <Link href={ROUTES.SIGNUP}>
            <Button size="lg">Start Free Today</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
