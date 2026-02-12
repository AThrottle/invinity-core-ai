/**
 * Auth Layout
 * ────────────
 * Centered card layout for login, signup, reset password, etc.
 * No navbar/footer — clean, focused auth experience.
 */

import Link from "next/link";
import { Infinity } from "lucide-react";
import { getAppConfig } from "@/lib/app-config";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getAppConfig();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      {/* Logo */}
      <Link
        href="/"
        className="mb-8 flex items-center space-x-2 text-foreground"
      >
        {config.logoUrl ? (
          <img src={config.logoUrl} alt={config.name} className="h-8 w-8 object-contain" />
        ) : (
          <Infinity className="h-8 w-8 text-primary" />
        )}
        <span className="text-2xl font-bold">{config.name}</span>
      </Link>

      {/* Auth Card */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {config.name}. All rights reserved.
      </p>
    </div>
  );
}
