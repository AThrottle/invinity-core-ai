"use client";

import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SetupStepWrapper, SetupInstruction } from "./setup-step-wrapper";
import type { SetupData } from "@/app/setup/page";

interface StepResendProps {
  data: SetupData;
  updateData: (partial: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepResend({
  data,
  updateData,
  onNext,
  onBack,
}: StepResendProps) {
  const canProceed =
    data.resendApiKey.length > 0 && data.resendFromEmail.length > 0;

  return (
    <SetupStepWrapper
      icon={<Mail className="h-5 w-5 text-primary" />}
      title="Connect Resend"
      description="Resend sends transactional emails: welcome, verification, password reset, billing alerts."
      canProceed={canProceed}
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">How to get your credentials:</h3>
        <SetupInstruction
          step={1}
          text="Go to resend.com and create a free account (or log in)."
          link="https://resend.com"
        />
        <SetupInstruction
          step={2}
          text="Go to API Keys then Create API Key. Give it a name like Infinity Core and copy the key (re_...)."
          link="https://resend.com/api-keys"
        />
        <SetupInstruction
          step={3}
          text="For the From email: you can use onboarding@resend.dev for testing. To use your own domain, add and verify it under Domains."
          link="https://resend.com/domains"
        />
      </div>

      <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
        <p className="text-sm text-emerald-800 dark:text-emerald-200">
          <strong>Free tier:</strong> Resend gives you 3,000 emails/month and 100 emails/day
          on the free plan. More than enough to get started.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor="resend-api">API Key</Label>
          <Input
            id="resend-api"
            type="password"
            placeholder="re_..."
            value={data.resendApiKey}
            onChange={(e) => updateData({ resendApiKey: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resend-from">From Email Address</Label>
          <Input
            id="resend-from"
            type="email"
            placeholder="noreply@yourdomain.com or onboarding@resend.dev"
            value={data.resendFromEmail}
            onChange={(e) => updateData({ resendFromEmail: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Use onboarding@resend.dev for testing before setting up a custom domain.
          </p>
        </div>
      </div>
    </SetupStepWrapper>
  );
}
