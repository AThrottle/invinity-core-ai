/**
 * Session Helpers
 * ────────────────
 * Utilities for accessing the current user session.
 * Works in Server Components, Server Actions, and Route Handlers.
 *
 * getSession() — returns the Supabase user or null
 * getUser() — returns the full user record from our DB (with plan info)
 * requireAuth() — throws redirect if not authenticated
 * requireAdmin() — throws redirect if not admin
 */

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";

/**
 * Get the current Supabase auth session.
 * Returns null if not authenticated.
 * Use in Server Components and Server Actions.
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get the full user record from our database.
 * Includes role, subscription, and plan information.
 * Returns null if not authenticated or user not found.
 */
export async function getUser() {
  const session = await getSession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

/**
 * Require authentication — redirect to login if not authenticated.
 * Use at the top of protected Server Components or Server Actions.
 *
 * Example:
 *   const user = await requireAuth();
 *   // user is guaranteed to exist here
 */
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect(ROUTES.LOGIN);
  }
  return user;
}

/**
 * Require admin role — redirect to dashboard if not admin.
 * Use at the top of admin-only Server Components.
 *
 * Example:
 *   const admin = await requireAdmin();
 *   // admin is guaranteed to have ADMIN role
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    redirect(ROUTES.DASHBOARD);
  }
  return user;
}
