/**
 * How It Works Section
 * ─────────────────────
 * Three-step process showing how easy it is to get started.
 */

import { GitBranch, Settings, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: GitBranch,
    title: "Clone the Repository",
    description:
      "One command to clone. Run npm install and start the dev server. The setup wizard launches automatically.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Connect Your Services",
    description:
      "The guided wizard walks you through connecting Supabase, Stripe, and Resend. Just paste your API keys.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Deploy & Start Selling",
    description:
      "Push to GitHub, deploy to Vercel with one click. Your SaaS is live and accepting payments in minutes.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Up and running in 3 steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From zero to revenue-generating SaaS in under 30 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/30 to-primary/10" />
              )}

              <div className="relative inline-flex mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                  {step.number}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
