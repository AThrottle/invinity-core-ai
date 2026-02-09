/**
 * Email Verification Page
 * ────────────────────────
 * Handles magic link callback for email verification.
 * Placeholder for Phase 2.
 */

import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default function VerifyPage() {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Check your email</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          We've sent you a verification link. Click the link in your email to
          verify your account.
        </p>
      </CardContent>
    </Card>
  );
}
