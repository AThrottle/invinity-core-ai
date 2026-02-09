/**
 * Setup Step: Validate
 * ─────────────────────
 * Tests all connections in real-time and shows pass/fail status
 * for each service. User can proceed once all checks pass.
 */

"use client";

import { useState } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SetupData } from "@/app/setup/page";

interface StepValidateProps {
  data: SetupData;
  onNext: () => void;
  onBack: () => void;
}

interface ValidationResult {
  service: string;
  status: "idle" | "checking" | "pass" | "fail";
  message: string;
}

export function StepValidate({ data, onNext, onBack }: StepValidateProps) {
  const [results, setResults] = useState<ValidationResult[]>([
    { service: "Supabase", status: "idle", message: "Not checked yet" },
    { service: "Stripe", status: "idle", message: "Not checked yet" },
    { service: "Resend", status: "idle", message: "Not checked yet" },
  ]);
  const [isValidating, setIsValidating] = useState(false);

  const allPassed = results.every((r) => r.status === "pass");

  const runValidation = async () => {
    setIsValidating(true);

    // Set all to "checking"
    setResults((prev) =>
      prev.map((r) => ({ ...r, status: "checking" as const, message: "Checking..." }))
    );

    try {
      const response = await fetch("/api/setup/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      setResults([
        {
          service: "Supabase",
          status: result.supabase?.success ? "pass" : "fail",
          message: result.supabase?.message || "Unknown error",
        },
        {
          service: "Stripe",
          status: result.stripe?.success ? "pass" : "fail",
          message: result.stripe?.message || "Unknown error",
        },
        {
          service: "Resend",
          status: result.resend?.success ? "pass" : "fail",
          message: result.resend?.message || "Unknown error",
        },
      ]);
    } catch (error) {
      setResults((prev) =>
        prev.map((r) => ({
          ...r,
          status: "fail" as const,
          message: "Could not reach validation API. Is the server running?",
        }))
      );
    }

    setIsValidating(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Validate Connections</CardTitle>
            <CardDescription>
              Let's test that all your credentials are working correctly.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Validation results */}
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.service}
              className={cn(
                "flex items-center justify-between rounded-lg border p-4 transition-colors",
                result.status === "pass" &&
                  "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30",
                result.status === "fail" &&
                  "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
                result.status === "checking" && "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
              )}
            >
              <div className="flex items-center gap-3">
                {result.status === "idle" && (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                )}
                {result.status === "checking" && (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                )}
                {result.status === "pass" && (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                )}
                {result.status === "fail" && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium text-sm">{result.service}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Run validation button */}
        <div className="flex justify-center">
          <Button
            onClick={runValidation}
            disabled={isValidating}
            variant={allPassed ? "outline" : "default"}
            size="lg"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : allPassed ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-validate
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Run Validation
              </>
            )}
          </Button>
        </div>

        {/* Success message */}
        {allPassed && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              All connections verified! Your services are ready to go.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!allPassed}>
          Generate Config
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
