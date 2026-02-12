/**
 * Admin Server Actions
 * ─────────────────────
 * Mutation operations for the admin panel:
 * - Change user roles
 * - Update app settings / feature flags
 * - Manage waitlist
 */

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// ── Verify Admin ─────────────────────────────

async function verifyAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") throw new Error("Not authorized");
  return session;
}

// ── Change User Role ─────────────────────────

export async function changeUserRole(formData: FormData) {
  await verifyAdmin();

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;

  if (!userId || !role) return { error: "Missing userId or role." };
  if (!["USER", "ADMIN"].includes(role)) return { error: "Invalid role." };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });

    revalidatePath("/admin/users");
    return { success: `User role updated to ${role}.` };
  } catch (error: any) {
    return { error: error.message || "Failed to update role." };
  }
}

// ── Create User ─────────────────────────────

export async function createUser(formData: FormData) {
  await verifyAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!name || name.trim().length < 2) return { error: "Name must be at least 2 characters." };
  if (!["USER", "ADMIN"].includes(role)) return { error: "Invalid role." };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: "Supabase credentials not configured." };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Create Supabase Auth user (email pre-confirmed, no verification needed)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      });

    if (authError) {
      return { error: authError.message };
    }

    // Create Prisma user record linked to Supabase Auth UID
    await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name,
        role: role as any,
        emailVerified: true,
      },
    });

    // Auto-assign Free plan
    const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });
    if (freePlan) {
      await prisma.subscription.create({
        data: {
          userId: authData.user.id,
          planId: freePlan.id,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    revalidatePath("/admin/users");
    return { success: `User ${email} created successfully.` };
  } catch (error: any) {
    return { error: error.message || "Failed to create user." };
  }
}

// ── Update App Setting ───────────────────────

export async function updateAppSetting(formData: FormData) {
  const session = await verifyAdmin();

  const key = formData.get("key") as string;
  const value = formData.get("value") as string;

  if (!key) return { error: "Setting key is required." };

  try {
    await prisma.appSettings.upsert({
      where: { key },
      update: {
        value: JSON.parse(value),
        updatedBy: session.id,
      },
      create: {
        key,
        value: JSON.parse(value),
        updatedBy: session.id,
      },
    });

    revalidatePath("/admin/config");
    return { success: `Setting "${key}" updated.` };
  } catch (error: any) {
    return { error: error.message || "Failed to update setting." };
  }
}

// ── Toggle Feature Flag ──────────────────────

export async function toggleFeatureFlag(formData: FormData) {
  const session = await verifyAdmin();

  const key = formData.get("key") as string;
  const enabled = formData.get("enabled") === "true";

  if (!key) return { error: "Feature key is required." };

  try {
    await prisma.appSettings.upsert({
      where: { key },
      update: {
        value: !enabled, // toggle
        updatedBy: session.id,
      },
      create: {
        key,
        value: !enabled,
        description: `Feature flag: ${key}`,
        updatedBy: session.id,
      },
    });

    revalidatePath("/admin/config");
    return { success: `Feature "${key}" ${!enabled ? "enabled" : "disabled"}.` };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle feature." };
  }
}

// ── Delete Waitlist Entry ────────────────────

export async function deleteWaitlistEntry(formData: FormData) {
  await verifyAdmin();

  const id = formData.get("id") as string;
  if (!id) return { error: "Entry ID required." };

  try {
    await prisma.waitList.delete({ where: { id } });
    revalidatePath("/admin/config");
    return { success: "Entry removed." };
  } catch (error: any) {
    return { error: error.message || "Failed to delete entry." };
  }
}

// ── Save Application Settings ───────────────

export async function saveAppSettings(formData: FormData) {
  const session = await verifyAdmin();

  const name = formData.get("name") as string;
  const tagline = formData.get("tagline") as string;
  const description = formData.get("description") as string;

  if (!name?.trim()) return { error: "App name is required." };

  try {
    const updates = [
      { key: "site.name", value: name.trim() },
      { key: "site.tagline", value: tagline?.trim() || "" },
      { key: "site.description", value: description?.trim() || "" },
    ];

    for (const { key, value } of updates) {
      await prisma.appSettings.upsert({
        where: { key },
        update: { value: JSON.stringify(value), updatedBy: session.id },
        create: {
          key,
          value: JSON.stringify(value),
          updatedBy: session.id,
        },
      });
    }

    revalidatePath("/", "layout");
    return { success: "Application settings saved." };
  } catch (error: any) {
    return { error: error.message || "Failed to save settings." };
  }
}

// ── Save Integration Keys ───────────────────

/**
 * Allowed env keys that can be updated via admin panel.
 * Whitelist prevents arbitrary env var injection.
 */
const ALLOWED_ENV_KEYS = [
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
] as const;

export async function saveIntegrationKeys(formData: FormData) {
  await verifyAdmin();

  const updates: Record<string, string> = {};
  for (const key of ALLOWED_ENV_KEYS) {
    const value = formData.get(key);
    if (value !== null) {
      updates[key] = value as string;
    }
  }

  if (Object.keys(updates).length === 0) {
    return { error: "No valid keys provided." };
  }

  try {
    const envPath = join(process.cwd(), ".env.local");
    let content: string;

    try {
      content = await readFile(envPath, "utf-8");
    } catch {
      return { error: ".env.local file not found. Run the setup wizard first." };
    }

    // Update existing keys or append new ones
    const lines = content.split("\n");
    const updatedKeys = new Set<string>();

    const updatedLines = lines.map((line) => {
      const trimmed = line.trim();
      // Skip comments and empty lines
      if (trimmed.startsWith("#") || trimmed === "") return line;

      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) return line;

      const key = trimmed.substring(0, eqIndex).trim();
      if (key in updates) {
        updatedKeys.add(key);
        return `${key}=${updates[key]}`;
      }
      return line;
    });

    // Append any keys that weren't found in the file
    for (const [key, value] of Object.entries(updates)) {
      if (!updatedKeys.has(key)) {
        updatedLines.push(`${key}=${value}`);
      }
    }

    await writeFile(envPath, updatedLines.join("\n"), "utf-8");

    revalidatePath("/admin/config");
    return { success: "Integration keys saved. Restart the server to apply changes." };
  } catch (error: any) {
    return { error: error.message || "Failed to save integration keys." };
  }
}
