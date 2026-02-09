/**
 * Testimonials Section
 * ─────────────────────
 * Social proof from customers. Placeholder data
 * that can be replaced via lib/config.ts.
 */

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "I went from idea to live SaaS in a single weekend. The setup wizard made connecting Stripe and Supabase incredibly easy.",
    name: "Sarah Chen",
    role: "Indie Maker",
    avatar: "SC",
  },
  {
    quote:
      "The admin panel alone saved me weeks of development. Real-time MRR tracking, user management, feature flags — it's all there.",
    name: "Marcus Johnson",
    role: "Technical Founder",
    avatar: "MJ",
  },
  {
    quote:
      "I used Cursor + Claude to customize this for my niche in a day. The code is so clean that AI tools understand it immediately.",
    name: "Elena Rodriguez",
    role: "AI-Assisted Builder",
    avatar: "ER",
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-t bg-muted/30 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by builders
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join hundreds of founders who shipped their SaaS faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <Card key={t.name} className="bg-card">
              <CardContent className="p-6">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
