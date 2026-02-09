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
