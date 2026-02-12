/**
 * Setup Detection Utility
 * ────────────────────────
 * Checks whether the Infinity Core Engine has been configured.
 * The app redirects to /setup if any required service is missing.
 *
 * Required services:
 * 1. Supabase (database + auth)
 *
 * Optional services (can be configured later):
 * 2. Stripe (payments)
 * 3. Resend (transactional email)
 *
 * Each service check returns { configured: boolean, message: string }
 * so the setup wizard can show exactly what's missing.
 */

export interface ServiceStatus {
  configured: boolean;
  message: string;
}

export interface SetupStatus {
  isComplete: boolean;
  supabase: ServiceStatus;
  stripe: ServiceStatus;
  resend: ServiceStatus;
  app: ServiceStatus;
}

/**
 * Check if all required environment variables are set.
 * Called on every request via middleware to detect unconfigured state.
 * Only Supabase + App config are required. Stripe and Resend are optional.
 */
export function checkSetupStatus(): SetupStatus {
  const supabase = checkSupabase();
  const stripe = checkStripe();
  const resend = checkResend();
  const app = checkApp();

  return {
    isComplete: supabase.configured && app.configured,
    supabase,
    stripe,
    resend,
    app,
  };
}

function checkSupabase(): ServiceStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.DATABASE_URL;

  if (!url || !anonKey || !serviceKey || !dbUrl) {
    const missing: string[] = [];
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    if (!dbUrl) missing.push("DATABASE_URL");
    return {
      configured: false,
      message: `Missing: ${missing.join(", ")}`,
    };
  }

  return { configured: true, message: "All Supabase credentials configured" };
}

function checkStripe(): ServiceStatus {
  const secret = process.env.STRIPE_SECRET_KEY;
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhook = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !publishable || !webhook) {
    const missing: string[] = [];
    if (!secret) missing.push("STRIPE_SECRET_KEY");
    if (!publishable) missing.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
    if (!webhook) missing.push("STRIPE_WEBHOOK_SECRET");
    return {
      configured: false,
      message: `Missing: ${missing.join(", ")}`,
    };
  }

  return { configured: true, message: "All Stripe credentials configured" };
}

function checkResend(): ServiceStatus {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    return { configured: false, message: "Missing: RESEND_API_KEY" };
  }
  if (!fromEmail) {
    return { configured: false, message: "Missing: RESEND_FROM_EMAIL" };
  }

  return { configured: true, message: "All Resend credentials configured" };
}

function checkApp(): ServiceStatus {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const authSecret = process.env.NEXTAUTH_SECRET;

  if (!appUrl || appUrl === "http://localhost:3000") {
    // localhost is fine for development
  }
  if (!authSecret || authSecret === "change-me-to-a-random-secret") {
    return {
      configured: false,
      message: "NEXTAUTH_SECRET must be set to a secure random value",
    };
  }

  return { configured: true, message: "App configuration complete" };
}

/**
 * Quick boolean check — used in middleware for fast redirect decisions.
 */
export function isSetupComplete(): boolean {
  return checkSetupStatus().isComplete;
}
