/**
 * Supabase Browser Client
 * ────────────────────────
 * Used in Client Components (browser-side).
 * Safe to use with the anon key (public).
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
