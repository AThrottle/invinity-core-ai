/**
 * Email Sending Utility
 * ──────────────────────
 * Sends transactional emails via Resend.
 * Each email type has a dedicated function with typed parameters
 * and a branded HTML template.
 *
 * Templates use inline styles for maximum email client compatibility.
 *
 * Usage:
 *   import { sendWelcomeEmail } from "@/lib/email";
 *   await sendWelcomeEmail({ to: "user@example.com", name: "John" });
 */

import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set.");
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const FROM = () => process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const APP_NAME = "Infinity Core"; // Fallback; ideally read from DB
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Base HTML wrapper for all emails.
 * Provides consistent branding, typography, and layout.
 */
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    <!-- Header -->
    <div style="padding:24px 32px;border-bottom:1px solid #e4e4e7;">
      <span style="font-size:18px;font-weight:700;color:#18181b;">${APP_NAME}</span>
    </div>
    <!-- Content -->
    <div style="padding:32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;text-align:center;">
      <p style="margin:0;font-size:12px;color:#71717a;">
        &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/** Blue button style for email CTAs */
function emailButton(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;margin:8px 0;">${text}</a>`;
}

// ── Welcome Email ────────────────────────────

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const resend = getResend();

  await resend.emails.send({
    from: `${APP_NAME} <${FROM()}>`,
    to,
    subject: `Welcome to ${APP_NAME}!`,
    html: emailWrapper(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#18181b;">Welcome, ${name}!</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Your account has been created successfully. You're all set to start using ${APP_NAME}.
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Head to your dashboard to get started:
      </p>
      ${emailButton("Go to Dashboard", `${APP_URL()}/dashboard`)}
      <p style="margin:24px 0 0;font-size:13px;color:#71717a;">
        If you have any questions, just reply to this email. We're here to help.
      </p>
    `),
  });
}

// ── Email Verification ───────────────────────

export async function sendVerificationEmail({
  to,
  verificationUrl,
}: {
  to: string;
  verificationUrl: string;
}) {
  const resend = getResend();

  await resend.emails.send({
    from: `${APP_NAME} <${FROM()}>`,
    to,
    subject: `Verify your email — ${APP_NAME}`,
    html: emailWrapper(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#18181b;">Verify your email</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Click the button below to verify your email address and activate your account.
      </p>
      ${emailButton("Verify Email", verificationUrl)}
      <p style="margin:24px 0 0;font-size:13px;color:#71717a;">
        This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    `),
  });
}

// ── Password Reset ───────────────────────────

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  const resend = getResend();

  await resend.emails.send({
    from: `${APP_NAME} <${FROM()}>`,
    to,
    subject: `Reset your password — ${APP_NAME}`,
    html: emailWrapper(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#18181b;">Reset your password</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        We received a request to reset your password. Click the button below to set a new one.
      </p>
      ${emailButton("Reset Password", resetUrl)}
      <p style="margin:24px 0 0;font-size:13px;color:#71717a;">
        This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
    `),
  });
}

// ── Subscription Confirmed ───────────────────

export async function sendSubscriptionConfirmEmail({
  to,
  name,
  planName,
  amount,
}: {
  to: string;
  name: string;
  planName: string;
  amount: string;
}) {
  const resend = getResend();

  await resend.emails.send({
    from: `${APP_NAME} <${FROM()}>`,
    to,
    subject: `Subscription confirmed — ${planName} plan`,
    html: emailWrapper(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#18181b;">You're subscribed!</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Hi ${name}, your <strong>${planName}</strong> plan is now active at <strong>${amount}/month</strong>.
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">
        You now have access to all ${planName} features. Manage your subscription anytime from your billing page.
      </p>
      ${emailButton("View Dashboard", `${APP_URL()}/dashboard`)}
    `),
  });
}

// ── Payment Failed ───────────────────────────

export async function sendPaymentFailedEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const resend = getResend();

  await resend.emails.send({
    from: `${APP_NAME} <${FROM()}>`,
    to,
    subject: `Action needed: Payment failed — ${APP_NAME}`,
    html: emailWrapper(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#18181b;">Payment failed</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Hi ${name}, we were unable to process your payment. Please update your payment method to keep your subscription active.
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">
        You have a 3-day grace period before your access is restricted.
      </p>
      ${emailButton("Update Payment Method", `${APP_URL()}/dashboard/billing`)}
    `),
  });
}

// ── Trial Ending ─────────────────────────────

export async function sendTrialEndingEmail({
  to,
  name,
  daysLeft,
}: {
  to: string;
  name: string;
  daysLeft: number;
}) {
  const resend = getResend();

  await resend.emails.send({
    from: `${APP_NAME} <${FROM()}>`,
    to,
    subject: `Your trial ends in ${daysLeft} days — ${APP_NAME}`,
    html: emailWrapper(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#18181b;">Trial ending soon</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Hi ${name}, your free trial ends in <strong>${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>.
        To keep access to all features, make sure your payment method is set up.
      </p>
      ${emailButton("Manage Subscription", `${APP_URL()}/dashboard/billing`)}
    `),
  });
}
