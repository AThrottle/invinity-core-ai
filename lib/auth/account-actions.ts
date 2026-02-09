/**
 * Account Management Server Actions
 * ───────────────────────────────────
 * Server actions for profile updates, password changes,
 * and account deletion. Used from the Settings page.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants";

// ── Update Profile ───────────────────────────

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const name = formData.get("name") as string;

  if (!name || name.trim().length < 2) {
    return { error: "Name must be at least 2 characters." };
  }

  try {
    await prisma.user.update({
      where: { id: session.id },
      data: { name: name.trim() },
    });

    // Also update Supabase Auth metadata
    const supabase = await createServerSupabaseClient();
    await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });

    revalidatePath(ROUTES.SETTINGS);
    return { success: "Profile updated successfully." };
  } catch (error: any) {
    return { error: error.message || "Failed to update profile." };
  }
}

// ── Update Avatar ────────────────────────────

export async function updateAvatar(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const avatarUrl = formData.get("avatarUrl") as string;

  if (!avatarUrl) {
    return { error: "No avatar URL provided." };
  }

  try {
    await prisma.user.update({
      where: { id: session.id },
      data: { avatarUrl },
    });

    revalidatePath(ROUTES.SETTINGS);
    return { success: "Avatar updated successfully." };
  } catch (error: any) {
    return { error: error.message || "Failed to update avatar." };
  }
}

// ── Change Password ──────────────────────────

export async function changePassword(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: "Password updated successfully." };
  } catch (error: any) {
    return { error: error.message || "Failed to update password." };
  }
}

// ── Delete Account ───────────────────────────

export async function deleteAccount() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  try {
    // Cancel Stripe subscription if exists
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { subscription: true },
    });

    if (user?.subscription?.stripeSubId) {
      const { getStripe } = await import("@/lib/stripe");
      const stripe = getStripe();
      try {
        await stripe.subscriptions.cancel(user.subscription.stripeSubId);
      } catch {
        // Subscription may already be canceled in Stripe
      }
    }

    // Delete all user data from our database
    await prisma.apiUsage.deleteMany({ where: { userId: session.id } });
    await prisma.subscription.deleteMany({ where: { userId: session.id } });
    await prisma.user.delete({ where: { id: session.id } });

    // Delete from Supabase Auth
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();

    // Note: Supabase admin API required to fully delete the auth user
    // This signs them out; the auth record remains but is inaccessible
  } catch (error: any) {
    return { error: error.message || "Failed to delete account." };
  }

  redirect(ROUTES.HOME);
}
