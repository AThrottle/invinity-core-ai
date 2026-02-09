/**
 * Hero Section
 * ─────────────
 * The first thing visitors see. Headline, subheadline,
 * dual CTAs, and background gradient.
 * All content driven by lib/config.ts.
 */

import Link from "next/link";
import { ArrowRight, Infinity, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { ROUTES } from "@/lib/constants";

export function HeroSection() {
  const parts = siteConfig.tagline.split(",");

  return (
    <section className="relative overflow-hidden">
      <div className="container py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Pill badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Infinity className="h-4 w-4 text-primary" />
            Production-Ready SaaS Boilerplate
            <span className="flex items-center gap-0.5 text-amber-500">
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {parts[0]}
            {parts.length > 1 && (
              <>
                ,<span className="text-primary">{parts[1]}</span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="mb-8 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
            {siteConfig.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={ROUTES.SIGNUP}>
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={ROUTES.PRICING}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Social proof micro */}
          <p className="mt-6 text-sm text-muted-foreground">
            Free to start &middot; No credit card required &middot; Deploy in minutes
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-primary/3 blur-3xl" />
      </div>
    </section>
  );
}
