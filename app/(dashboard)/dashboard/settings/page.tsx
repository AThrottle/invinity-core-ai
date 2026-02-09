/**
 * Settings Page
 * ──────────────
 * Account settings with real server actions:
 * - Profile editing (name, avatar)
 * - Password change
 * - Account deletion with confirmation
 *
 * This is a server component that fetches user data,
 * then renders client form components.
 */

import { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { SettingsClient } from "@/components/dashboard/settings-client";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <SettingsClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
    />
  );
}
