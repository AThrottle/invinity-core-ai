/**
 * Setup Wizard Page
 * ──────────────────
 * The first thing a user sees after cloning the repo.
 * Guides them through connecting Supabase (required) and
 * configuring branding. Stripe and Resend can be added later.
 *
 * This page is intentionally a Client Component because it
 * manages multi-step form state and real-time validation.
 */

"use client";

import { useState } from "react";
import { StepWelcome } from "@/components/setup/step-welcome";
import { StepSupabase } from "@/components/setup/step-supabase";
import { StepBranding } from "@/components/setup/step-branding";
import { StepValidate } from "@/components/setup/step-validate";
import { StepComplete } from "@/components/setup/step-complete";
import { SetupProgress } from "@/components/setup/setup-progress";

/**
 * All configuration values collected across steps.
 * Passed between steps and submitted to the validation API.
 */
export interface SetupData {
  // Supabase (required)
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  databaseUrl: string;
  // Stripe (optional — configure later)
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  // Resend (optional — configure later)
  resendApiKey: string;
  resendFromEmail: string;
  // Branding
  appName: string;
  appTagline: string;
  appUrl: string;
}

const INITIAL_DATA: SetupData = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseServiceRoleKey: "",
  databaseUrl: "",
  stripeSecretKey: "",
  stripePublishableKey: "",
  stripeWebhookSecret: "",
  resendApiKey: "",
  resendFromEmail: "",
  appName: "Infinity Core",
  appTagline: "Build your SaaS in minutes, not months",
  appUrl: "http://localhost:3000",
};

const STEPS = [
  { id: "welcome", title: "Welcome", number: 0 },
  { id: "supabase", title: "Database & Auth", number: 1 },
  { id: "branding", title: "Branding", number: 2 },
  { id: "validate", title: "Validate", number: 3 },
  { id: "complete", title: "Complete", number: 4 },
];

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<SetupData>(INITIAL_DATA);

  /** Move to next step */
  const next = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));

  /** Move to previous step */
  const back = () => setCurrentStep((s) => Math.max(s - 1, 0));

  /** Update data from a step */
  const updateData = (partial: Partial<SetupData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="space-y-8">
      {/* Progress indicator — hidden on welcome and complete screens */}
      {currentStep > 0 && currentStep < STEPS.length - 1 && (
        <SetupProgress steps={STEPS.slice(1, -1)} currentStep={currentStep - 1} />
      )}

      {/* Step content */}
      {currentStep === 0 && <StepWelcome onNext={next} />}
      {currentStep === 1 && (
        <StepSupabase data={data} updateData={updateData} onNext={next} onBack={back} />
      )}
      {currentStep === 2 && (
        <StepBranding data={data} updateData={updateData} onNext={next} onBack={back} />
      )}
      {currentStep === 3 && (
        <StepValidate data={data} onNext={next} onBack={back} />
      )}
      {currentStep === 4 && <StepComplete data={data} />}
    </div>
  );
}
