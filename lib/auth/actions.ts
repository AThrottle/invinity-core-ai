/**
 * Authentication Server Actions
 * ──────────────────────────────
 * All auth operations as Next.js server actions.
 * These run on the server and can be called directly from client forms.
 *
 * Actions:
 * - signUpWithEmail: Create account with email/password
 * - signInWithEmail: Log in with email/password
 * - signInWithOAuth: Redirect to Google/GitHub OAuth
 * - signOut: Clear session and redirect
 * - resetPassword: Send password reset email
 * - updatePassword: Set new password from reset link
 */

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";

// ── Sign Up ──────────────────────────────────

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate inputs
  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!name || name.trim().length < 2) {
    return { error: "Please enter your full name." };
  }

  // Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create matching record in our database
  if (data.user) {
    try {
      await prisma.user.upsert({
        where: { email },
        update: { name },
        create: {
          id: data.user.id,
          email,
          name,
          role: "USER",
        },
      });
    } catch (dbError) {
      console.error("Failed to create user record:", dbError);
      // Don't block signup — the record can be created on first login
    }
  }

  // Redirect to verification page
  redirect(ROUTES.VERIFY);
}

// ── Sign In ──────────────────────────────────

export async function signInWithEmail(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure user exists in our database (handles OAuth-first users)
  if (data.user) {
    await ensureUserRecord(data.user.id, data.user.email!, data.user.user_metadata?.full_name);
  }

  revalidatePath("/", "layout");
  redirect(ROUTES.DASHBOARD);
}

// ── OAuth ────────────────────────────────────

export async function signInWithOAuth(provider: "google" | "github") {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

// ── Sign Out ─────────────────────────────────

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(ROUTES.HOME);
}

// ── Password Reset ───────────────────────────

export async function resetPassword(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password reset email sent. Check your inbox." };
}

// ── Update Password ──────────────────────────

export async function updatePassword(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect(ROUTES.LOGIN);
}

// ── Helpers ──────────────────────────────────

/**
 * Ensure a user record exists in our database.
 * Called on every login to handle edge cases:
 * - User signed up with OAuth (no DB record yet)
 * - User signed up with email, then logs in with OAuth
 */
async function ensureUserRecord(
  id: string,
  email: string,
  name?: string
) {
  try {
    await prisma.user.upsert({
      where: { email },
      update: { id }, // Link to Supabase auth ID if changed
      create: {
        id,
        email,
        name: name || null,
        role: "USER",
      },
    });
  } catch (error) {
    console.error("Failed to ensure user record:", error);
  }
}
