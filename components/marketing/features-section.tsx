/**
 * Features Section
 * ─────────────────
 * 6 feature cards in a responsive grid.
 * Icons and content driven by lib/config.ts.
 */

import {
  Shield,
  CreditCard,
  LayoutDashboard,
  Sparkles,
  Rocket,
  Mail,
} from "lucide-react";
import { siteConfig } from "@/lib/config";

const iconMap: Record<string, React.ElementType> = {
  Shield,
  CreditCard,
  LayoutDashboard,
  Sparkles,
  Rocket,
  Mail,
};

export function FeaturesSection() {
  return (
    <section id="features" className="border-t bg-muted/30 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to launch
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Auth, payments, admin, email, and more — all wired up and ready to go.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {siteConfig.features.map((feature) => {
            const Icon = iconMap[feature.icon] || Sparkles;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
