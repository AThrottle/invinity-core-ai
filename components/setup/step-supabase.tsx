"use client";

import { Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SetupStepWrapper, SetupInstruction } from "./setup-step-wrapper";
import type { SetupData } from "@/app/setup/page";

interface StepSupabaseProps {
  data: SetupData;
  updateData: (partial: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepSupabase({
  data,
  updateData,
  onNext,
  onBack,
}: StepSupabaseProps) {
  const canProceed =
    data.supabaseUrl.length > 0 &&
    data.supabaseAnonKey.length > 0 &&
    data.supabaseServiceRoleKey.length > 0 &&
    data.databaseUrl.length > 0;

  return (
    <SetupStepWrapper
      icon={<Database className="h-5 w-5 text-primary" />}
      title="Connect Supabase"
      description="Supabase provides your PostgreSQL database and user authentication."
      canProceed={canProceed}
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">How to get your credentials:</h3>
        <SetupInstruction
          step={1}
          text="Go to supabase.com and create a free account (or log in)."
          link="https://supabase.com/dashboard"
        />
        <SetupInstruction
          step={2}
          text="Click New Project. Choose a name, set a database password (save it!), and select a region close to your users."
        />
        <SetupInstruction
          step={3}
          text="Once created, go to Project Settings then API. Copy your Project URL, anon public key, and service_role secret key."
          link="https://supabase.com/dashboard/project/_/settings/api"
        />
        <SetupInstruction
          step={4}
          text="For the Database URL, go to Project Settings then Database then Connection String. Select Transaction mode."
          link="https://supabase.com/dashboard/project/_/settings/database"
        />
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor="supabase-url">Project URL</Label>
          <Input
            id="supabase-url"
            placeholder="https://your-project-id.supabase.co"
            value={data.supabaseUrl}
            onChange={(e) => updateData({ supabaseUrl: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supabase-anon">Anon (Public) Key</Label>
          <Input
            id="supabase-anon"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp..."
            value={data.supabaseAnonKey}
            onChange={(e) => updateData({ supabaseAnonKey: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Safe to expose client-side. Used for browser authentication.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supabase-service">Service Role Key</Label>
          <Input
            id="supabase-service"
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp..."
            value={data.supabaseServiceRoleKey}
            onChange={(e) =>
              updateData({ supabaseServiceRoleKey: e.target.value })
            }
          />
          <p className="text-xs text-destructive">
            Keep this secret! Never expose in client-side code.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="database-url">Database Connection String</Label>
          <Input
            id="database-url"
            type="password"
            placeholder="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"
            value={data.databaseUrl}
            onChange={(e) => updateData({ databaseUrl: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Use the Transaction mode connection string from Database Settings.
          </p>
        </div>
      </div>
    </SetupStepWrapper>
  );
}
