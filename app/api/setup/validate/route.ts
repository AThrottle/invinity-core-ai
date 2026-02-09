/**
 * Setup Validation API
 * ─────────────────────
 * Tests connections to Supabase, Stripe, and Resend using
 * the credentials provided by the setup wizard.
 *
 * POST /api/setup/validate
 * Body: { supabaseUrl, supabaseAnonKey, stripeSecretKey, ... }
 * Returns: { supabase: { success, message }, stripe: {...}, resend: {...} }
 *
 * Each service is tested independently — one failure doesn't block others.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const data = await request.json();

  // Run all validations in parallel for speed
  const [supabase, stripe, resend] = await Promise.all([
    validateSupabase(data.supabaseUrl, data.supabaseAnonKey),
    validateStripe(data.stripeSecretKey),
    validateResend(data.resendApiKey),
  ]);

  return NextResponse.json({ supabase, stripe, resend });
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

/**
 * Test Stripe connection by listing one product.
 * If the secret key is valid, Stripe will respond.
 */
async function validateStripe(
  secretKey: string
): Promise<{ success: boolean; message: string }> {
  if (!secretKey) {
    return { success: false, message: "Missing Stripe secret key" };
  }

  try {
    const response = await fetch("https://api.stripe.com/v1/products?limit=1", {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    if (response.ok) {
      return { success: true, message: "Connected to Stripe successfully" };
    }

    const error = await response.json();
    return {
      success: false,
      message: error.error?.message || `Stripe error: ${response.status}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Could not reach Stripe: ${error.message || "Connection failed"}`,
    };
  }
}

/**
 * Test Resend connection by listing API keys.
 * If the API key is valid, Resend will respond.
 */
async function validateResend(
  apiKey: string
): Promise<{ success: boolean; message: string }> {
  if (!apiKey) {
    return { success: false, message: "Missing Resend API key" };
  }

  try {
    const response = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { success: true, message: "Connected to Resend successfully" };
    }

    // Resend returns 401 for invalid keys
    if (response.status === 401 || response.status === 403) {
      return { success: false, message: "Invalid Resend API key" };
    }

    return {
      success: false,
      message: `Resend error: ${response.status}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Could not reach Resend: ${error.message || "Connection failed"}`,
    };
  }
}
