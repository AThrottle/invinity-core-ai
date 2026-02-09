/**
 * Setup Step Wrapper
 * ───────────────────
 * Consistent wrapper for each setup step.
 * Provides title, description, navigation buttons, and info callouts.
 */

"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SetupStepWrapperProps {
  /** Step icon (React element) */
  icon: React.ReactNode;
  /** Step title */
  title: string;
  /** Short description of what this step does */
  description: string;
  /** Disable the Next button until the step is valid */
  canProceed: boolean;
  /** Custom label for the Next button */
  nextLabel?: string;
  /** Move to next step */
  onNext: () => void;
  /** Move to previous step */
  onBack: () => void;
  /** The step's form content */
  children: React.ReactNode;
}

export function SetupStepWrapper({
  icon,
  title,
  description,
  canProceed,
  nextLabel = "Continue",
  onNext,
  onBack,
  children,
}: SetupStepWrapperProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            {icon}
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">{children}</CardContent>

      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          {nextLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Instruction callout used within setup steps.
 * Shows the user exactly where to find a credential.
 */
export function SetupInstruction({
  step,
  text,
  link,
}: {
  step: number;
  text: string;
  link?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-muted/50 p-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
        {step}
      </span>
      <p className="text-sm text-muted-foreground">
        {text}
        {link && (
          <>
            {" "}
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Open link &rarr;
            </a>
          </>
        )}
      </p>
    </div>
  );
}
