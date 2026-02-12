/**
 * Setup Validation API
 * ─────────────────────
 * Tests the Supabase connection using the credentials provided
 * by the setup wizard. Stripe and Resend are optional and can
 * be configured later.
 *
 * POST /api/setup/validate
 * Body: { supabaseUrl, supabaseAnonKey }
 * Returns: { supabase: { success, message } }
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const data = await request.json();

  const supabase = await validateSupabase(data.supabaseUrl, data.supabaseAnonKey);

  return NextResponse.json({ supabase });
}

/**
 * Test Supabase connection by calling the health endpoint.
 * If the URL and anon key are valid, the REST API will respond.
 */
async function validateSupabase(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: "Missing Supabase URL or anon key" };
  }

  try {
    // Test the REST API with anon key auth
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    if (response.ok || response.status === 200) {
      return { success: true, message: "Connected to Supabase successfully" };
    }

    return {
      success: false,
      message: `Supabase responded with status ${response.status}. Check your URL and anon key.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Could not reach Supabase: ${error.message || "Connection failed"}`,
    };
  }
}

