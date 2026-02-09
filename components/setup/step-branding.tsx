/**
 * Setup Step: Branding
 * ─────────────────────
 * Configure the app name, tagline, and URL.
 * These values are written to .env.local and lib/config.ts.
 */

"use client";

import { Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SetupStepWrapper } from "./setup-step-wrapper";
import type { SetupData } from "@/app/setup/page";

interface StepBrandingProps {
  data: SetupData;
  updateData: (partial: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepBranding({ data, updateData, onNext, onBack }: StepBrandingProps) {
  const canProceed = data.appName.length > 0 && data.appUrl.length > 0;

  return (
    <SetupStepWrapper
      icon={<Palette className="h-5 w-5 text-primary" />}
      title="Brand Your App"
      description="Give your SaaS a name. You can always change these later in lib/config.ts."
      canProceed={canProceed}
      nextLabel="Validate Setup"
      onNext={onNext}
      onBack={onBack}
    >
      {/* Form fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="app-name">App Name</Label>
          <Input
            id="app-name"
            placeholder="My SaaS Product"
            value={data.appName}
            onChange={(e) => updateData({ appName: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Shown in the navbar, page titles, and email templates.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-tagline">Tagline</Label>
          <Input
            id="app-tagline"
            placeholder="Build amazing things faster"
            value={data.appTagline}
            onChange={(e) => updateData({ appTagline: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Shown on the landing page hero section.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-url">App URL</Label>
          <Input
            id="app-url"
            placeholder="https://myapp.vercel.app"
            value={data.appUrl}
            onChange={(e) => updateData({ appUrl: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Use <code className="bg-muted px-1 rounded">http://localhost:3000</code> for
            local development. Update to your production URL after deploying.
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
          Preview
        </p>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {data.appName.charAt(0) || "?"}
          </div>
          <div>
            <p className="font-semibold text-sm">{data.appName || "Your App"}</p>
            <p className="text-xs text-muted-foreground">
              {data.appTagline || "Your tagline here"}
            </p>
          </div>
        </div>
      </div>
    </SetupStepWrapper>
  );
}
