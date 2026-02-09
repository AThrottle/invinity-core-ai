/**
 * Setup Wizard Layout
 * ────────────────────
 * Standalone layout for the setup wizard — no navbar, sidebar, or footer.
 * Clean, focused experience for first-time configuration.
 */

import { Infinity } from "lucide-react";

export const metadata = {
  title: "Setup | Infinity Core Engine",
  description: "Configure your Infinity Core Engine installation",
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Minimal header */}
      <header className="border-b bg-white/80 backdrop-blur dark:bg-slate-950/80">
        <div className="container flex h-14 items-center">
          <Infinity className="h-5 w-5 text-primary mr-2" />
          <span className="font-semibold text-sm">Infinity Core Engine</span>
          <span className="ml-2 text-xs text-muted-foreground">Setup Wizard</span>
        </div>
      </header>

      <main className="container max-w-3xl py-8 md:py-12">{children}</main>
    </div>
  );
}
