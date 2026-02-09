/**
 * Final CTA Section
 * ──────────────────
 * Compelling call-to-action at the bottom of the landing page
 * with email capture or direct signup link.
 */

import Link from "next/link";
import { ArrowRight, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { ROUTES } from "@/lib/constants";

export function CTASection() {
  return (
    <section className="border-t">
      <div className="container py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Infinity className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to launch your SaaS?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Stop building boilerplate. Start building your product.
            Clone, configure, deploy, and start collecting revenue today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={ROUTES.SIGNUP}>
              <Button size="lg" className="text-base px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={siteConfig.links.github}>
              <Button variant="outline" size="lg" className="text-base px-8">
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
