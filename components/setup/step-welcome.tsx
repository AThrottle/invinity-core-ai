/**
 * Setup Step: Welcome
 * ─────────────────────
 * First screen the user sees. Explains what they'll need
 * and sets expectations for the setup process.
 */

"use client";

import {
  Infinity,
  Database,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StepWelcomeProps {
  onNext: () => void;
}

const prerequisites = [
  {
    icon: Database,
    title: "Supabase Account",
    description: "Free tier — handles your database and user authentication",
    link: "https://supabase.com",
    time: "2 min",
  },
];

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mx-auto">
          <Infinity className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Infinity Core Engine
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Let's get your SaaS up and running. You just need to connect your
          database and you're good to go. Stripe and Resend can be added later.
        </p>
      </div>

      {/* Time estimate */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Total setup time: ~3 minutes</span>
      </div>

      {/* Prerequisites */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">
          What you'll need
        </h2>
        <div className="grid gap-4">
          {prerequisites.map((item) => (
            <Card key={item.title} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      ~{item.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tip */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Quick start:</strong> All you need is a Supabase account (free tier).
            Payments (Stripe) and emails (Resend) can be configured later from your .env.local file.
          </p>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={onNext} className="px-8">
          Let's Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
