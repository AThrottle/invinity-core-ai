/**
 * Admin App Configuration
 * ────────────────────────
 * Settings editor, feature flags, and waitlist management.
 * Changes take effect immediately without code deployment.
 */

import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { getWaitlist } from "@/lib/admin/queries";
import { ConfigClient } from "@/components/admin/config-client";

export const metadata: Metadata = {
  title: "App Configuration",
};

export default async function AdminConfigPage() {
  await requireAdmin();

  // Fetch all settings
  const settings = await prisma.appSettings.findMany({
    orderBy: { key: "asc" },
  });

  // Fetch waitlist
  const waitlist = await getWaitlist({ page: 1, perPage: 50 });

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
    />
  );
}
