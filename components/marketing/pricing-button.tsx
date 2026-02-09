/**
 * Pricing Button
 * ───────────────
 * Smart button for the pricing page:
 * - Free plan → links to signup
 * - Paid plan (unauthenticated) → links to signup
 * - Paid plan (authenticated) → creates Stripe Checkout session
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";

interface PricingButtonProps {
  planSlug: string;
  stripePriceId: string | null;
  price: number;
  isPopular: boolean;
}

export function PricingButton({
  planSlug,
  stripePriceId,
  price,
  isPopular,
}: PricingButtonProps) {
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    // Free plan or no Stripe price → go to signup
    if (price === 0 || !stripePriceId) {
      router.push(user ? "/dashboard" : "/signup");
      return;
    }

    // Not authenticated → go to signup first
    if (!user) {
      router.push("/signup");
      return;
    }

    // Authenticated with paid plan → create checkout session
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: stripePriceId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to start checkout.",
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
    setLoading(false);
  }

  const label =
    price === 0
      ? "Get Started"
      : user
      ? "Subscribe"
      : "Get Started";

  return (
    <Button
      className="w-full"
      variant={isPopular ? "default" : "outline"}
      onClick={handleClick}
      disabled={loading || userLoading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {label}
    </Button>
  );
}
