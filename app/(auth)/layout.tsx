/**
 * Auth Layout
 * ────────────
 * Centered card layout for login, signup, reset password, etc.
 * No navbar/footer — clean, focused auth experience.
 */

import Link from "next/link";
import { Infinity } from "lucide-react";
import { siteConfig } from "@/lib/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      {/* Logo */}
      <Link
        href="/"
        className="mb-8 flex items-center space-x-2 text-foreground"
      >
        <Infinity className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">{siteConfig.name}</span>
      </Link>

      {/* Auth Card */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </p>
    </div>
  );
}
