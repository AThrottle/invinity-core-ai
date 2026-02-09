/**
 * OAuth Callback Handler
 * ───────────────────────
 * Handles the redirect from Supabase OAuth (Google/GitHub).
 * Exchanges the auth code for a session, ensures a DB user record
 * exists, then redirects to the dashboard.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createServerSupabaseClient();

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure user record exists in our database
      const user = data.user;
      try {
        await prisma.user.upsert({
          where: { email: user.email! },
          update: {
            id: user.id,
            name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              null,
            avatarUrl: user.user_metadata?.avatar_url || null,
            emailVerified: !!user.email_confirmed_at,
          },
          create: {
            id: user.id,
            email: user.email!,
            name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              null,
            avatarUrl: user.user_metadata?.avatar_url || null,
            role: "USER",
            emailVerified: !!user.email_confirmed_at,
          },
        });
      } catch (dbError) {
        console.error("Failed to sync user record on OAuth callback:", dbError);
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
