/**
 * Landing Page
 * ─────────────
 * Public marketing homepage assembled from modular sections.
 * Each section is a standalone component that reads from lib/config.ts.
 *
 * Sections (in order):
 * 1. Hero — headline, CTAs, social proof micro
 * 2. Social Proof — logo bar of technologies used
 * 3. Features — 6 feature cards from config
 * 4. How It Works — 3-step process
 * 5. Testimonials — 3 customer quotes
 * 6. Pricing Preview — plan cards (links to /pricing)
 * 7. FAQ — accordion from config
 * 8. Final CTA — compelling signup push
 *
 * CUSTOMIZATION: Edit lib/config.ts to change all content.
 * Use AI prompts to rewrite copy for your niche.
 */

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { CTASection } from "@/components/marketing/cta-section";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export default async function HomePage() {
  // Fetch plans for the pricing preview
  let plans: any[] = [];
  try {
    plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    // DB not connected yet — use empty array
  }

  return (
    <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Social Proof — Tech logos */}
      <section className="border-t border-b py-10">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Built with the most trusted technologies in the industry
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
            {["Next.js", "TypeScript", "Supabase", "Stripe", "Tailwind CSS", "Prisma", "Vercel"].map(
              (tech) => (
                <span
                  key={tech}
                  className="text-sm font-semibold tracking-wide text-foreground/70"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* 3. Features */}
      <FeaturesSection />

      {/* 4. How It Works */}
      <HowItWorksSection />

      {/* 5. Testimonials */}
      <TestimonialsSection />

      {/* 6. Pricing Preview */}
      {plans.length > 0 && (
        <section id="pricing" className="py-20 md:py-28">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start free. Upgrade when you need more.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {plans.map((plan) => {
                const features = JSON.parse(plan.features as string) as string[];
                const isPopular = plan.slug === "pro";

                return (
                  <Card
                    key={plan.id}
                    className={`relative flex flex-col ${
                      isPopular ? "border-primary shadow-lg md:scale-105" : ""
                    }`}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">
                          {plan.price === 0 ? "$0" : formatCurrency(plan.price)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-muted-foreground text-sm">/mo</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-2">
                        {features.slice(0, 5).map((f: string) => (
                          <li key={f} className="flex items-start text-sm">
                            <Check className="h-4 w-4 text-primary mt-0.5 mr-2 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href={ROUTES.SIGNUP} className="w-full">
                        <Button
                          className="w-full"
                          variant={isPopular ? "default" : "outline"}
                          size="sm"
                        >
                          {plan.price === 0 ? "Get Started" : "Subscribe"}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link href={ROUTES.PRICING}>
                <Button variant="link">
                  View full plan comparison &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 7. FAQ */}
      <FAQSection />

      {/* 8. Final CTA */}
      <CTASection />
    </>
  );
}
