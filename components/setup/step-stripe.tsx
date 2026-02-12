"use client";

import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SetupStepWrapper, SetupInstruction } from "./setup-step-wrapper";
import type { SetupData } from "@/app/setup/page";

interface StepStripeProps {
  data: SetupData;
  updateData: (partial: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepStripe({
  data,
  updateData,
  onNext,
  onBack,
}: StepStripeProps) {
  const canProceed =
    data.stripeSecretKey.length > 0 &&
    data.stripePublishableKey.length > 0 &&
    data.stripeWebhookSecret.length > 0;

  return (
    <SetupStepWrapper
      icon={<CreditCard className="h-5 w-5 text-primary" />}
      title="Connect Stripe"
      description="Stripe handles subscription payments, checkout, and billing portal."
      canProceed={canProceed}
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">How to get your credentials:</h3>
        <SetupInstruction
          step={1}
          text="Go to stripe.com and create a free account (or log in). Make sure you are in Test Mode (toggle in top-right)."
          link="https://dashboard.stripe.com"
        />
        <SetupInstruction
          step={2}
          text="Go to Developers then API Keys. Copy your Publishable key (pk_test_...) and Secret key (sk_test_...)."
          link="https://dashboard.stripe.com/test/apikeys"
        />
        <SetupInstruction
          step={3}
          text="Install the Stripe CLI from the link below. Then run: stripe login"
          link="https://docs.stripe.com/stripe-cli#install"
        />
        <SetupInstruction
          step={4}
          text="In a separate terminal, run: npm run stripe:listen — This forwards Stripe events to your local server. Copy the webhook signing secret (whsec_...) from the output."
        />
      </div>

      <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Start in Test Mode!</strong> Use test keys (sk_test_..., pk_test_...) while
          building. Switch to live keys only when ready for real payments.
        </p>
      </div>

      <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Local dev tip:</strong> Keep{" "}
          <code className="text-xs bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">npm run stripe:listen</code>{" "}
          running in a separate terminal alongside{" "}
          <code className="text-xs bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">npm run dev</code>.
          The CLI webhook secret changes each session, so update your .env.local if you restart it.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor="stripe-publishable">Publishable Key</Label>
          <Input
            id="stripe-publishable"
            placeholder="pk_test_..."
            value={data.stripePublishableKey}
            onChange={(e) =>
              updateData({ stripePublishableKey: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Safe to expose client-side. Used in the checkout form.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stripe-secret">Secret Key</Label>
          <Input
            id="stripe-secret"
            type="password"
            placeholder="sk_test_..."
            value={data.stripeSecretKey}
            onChange={(e) => updateData({ stripeSecretKey: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stripe-webhook">Webhook Signing Secret</Label>
          <Input
            id="stripe-webhook"
            type="password"
            placeholder="whsec_..."
            value={data.stripeWebhookSecret}
            onChange={(e) =>
              updateData({ stripeWebhookSecret: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Found on the webhook endpoint details page after creation.
          </p>
        </div>
      </div>
    </SetupStepWrapper>
  );
}
