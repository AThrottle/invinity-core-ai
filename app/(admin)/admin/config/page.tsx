/**
 * Admin App Configuration
 * ────────────────────────
 * Settings editor, feature flags, integrations, and waitlist management.
 * Changes take effect immediately without code deployment.
 */

import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { getWaitlist } from "@/lib/admin/queries";
import { checkSetupStatus } from "@/lib/setup";
import { getAppConfig } from "@/lib/app-config";
import { ConfigClient } from "@/components/admin/config-client";

export const metadata: Metadata = {
  title: "App Configuration",
};

/** Mask a secret key for display: show first 7 + last 4 chars */
function maskKey(value: string | undefined): string {
  if (!value || value.length < 12) return value ? "••••••••" : "";
  return `${value.slice(0, 7)}...${value.slice(-4)}`;
}

export default async function AdminConfigPage() {
  await requireAdmin();

  // Fetch all settings
  const settings = await prisma.appSettings.findMany({
    orderBy: { key: "asc" },
  });

  // Fetch waitlist
  const waitlist = await getWaitlist({ page: 1, perPage: 50 });

  // Fetch integration status
  const setupStatus = checkSetupStatus();
  const integrations = {
    stripe: {
      configured: setupStatus.stripe.configured,
      message: setupStatus.stripe.message,
      keys: {
        STRIPE_SECRET_KEY: maskKey(process.env.STRIPE_SECRET_KEY),
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: maskKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
        STRIPE_WEBHOOK_SECRET: maskKey(process.env.STRIPE_WEBHOOK_SECRET),
      },
    },
    resend: {
      configured: setupStatus.resend.configured,
      message: setupStatus.resend.message,
      keys: {
        RESEND_API_KEY: maskKey(process.env.RESEND_API_KEY),
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "",
      },
    },
  };

  // Fetch current branding
  const appConfig = await getAppConfig();

  return (
    <ConfigClient
      settings={settings.map((s) => ({
        id: s.id,
        key: s.key,
        value: s.value,
        description: s.description,
      }))}
      waitlist={waitlist.entries.map((w) => ({
        id: w.id,
        email: w.email,
        source: w.source,
        createdAt: w.createdAt.toISOString(),
      }))}
      waitlistTotal={waitlist.total}
      integrations={integrations}
      appConfig={appConfig}
    />
  );
}
