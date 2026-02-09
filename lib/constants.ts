/**
 * Application Constants
 * ─────────────────────
 * Route paths, API endpoints, error messages, and configuration values.
 * Centralized here to avoid magic strings throughout the codebase.
 */

// ── Route Paths ──────────────────────────────
export const ROUTES = {
  // Public
  HOME: "/",
  PRICING: "/pricing",

  // Auth
  LOGIN: "/login",
  SIGNUP: "/signup",
  RESET_PASSWORD: "/reset-password",
  UPDATE_PASSWORD: "/update-password",
  VERIFY: "/verify",

  // Dashboard (protected)
  DASHBOARD: "/dashboard",
  SETTINGS: "/dashboard/settings",
  BILLING: "/dashboard/billing",

  // Admin (protected + admin role)
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_SUBSCRIPTIONS: "/admin/subscriptions",
  ADMIN_CONFIG: "/admin/config",
} as const;

// ── API Endpoints ────────────────────────────
export const API = {
  AUTH_CALLBACK: "/api/auth/callback",
  STRIPE_CHECKOUT: "/api/stripe/checkout",
  STRIPE_PORTAL: "/api/stripe/portal",
  STRIPE_WEBHOOK: "/api/webhooks/stripe",
  WAITLIST: "/api/waitlist",
} as const;

// ── Error Messages ───────────────────────────
export const ERRORS = {
  UNAUTHORIZED: "You must be logged in to access this resource.",
  FORBIDDEN: "You do not have permission to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  RATE_LIMITED: "Too many requests. Please try again later.",
  INVALID_INPUT: "The provided input is invalid.",
  SUBSCRIPTION_REQUIRED: "An active subscription is required for this feature.",
  PLAN_LIMIT_REACHED: "You have reached the limit for your current plan.",
  STRIPE_ERROR: "Payment processing error. Please try again.",
  SERVER_ERROR: "An internal server error occurred. Please try again later.",
} as const;

// ── Success Messages ─────────────────────────
export const SUCCESS = {
  LOGIN: "Welcome back!",
  SIGNUP: "Account created! Please check your email to verify.",
  LOGOUT: "You have been logged out.",
  PASSWORD_RESET: "Password reset email sent. Check your inbox.",
  PASSWORD_UPDATED: "Password updated successfully.",
  EMAIL_VERIFIED: "Email verified successfully!",
  PROFILE_UPDATED: "Profile updated successfully.",
  SUBSCRIPTION_CREATED: "Subscription activated! Welcome aboard.",
  SUBSCRIPTION_CANCELED: "Subscription canceled. You'll retain access until the end of the billing period.",
  WAITLIST_JOINED: "You're on the list! We'll notify you when we launch.",
} as const;

// ── Rate Limits ──────────────────────────────
export const RATE_LIMITS = {
  DEFAULT: { requests: 100, window: 60 }, // 100 req/min
  AUTH: { requests: 10, window: 60 },     // 10 req/min for auth endpoints
  API: { requests: 60, window: 60 },      // 60 req/min for API endpoints
  WEBHOOK: { requests: 200, window: 60 }, // 200 req/min for webhooks
} as const;

// ── Subscription Grace Period ────────────────
export const GRACE_PERIOD_DAYS = 3; // Days of access after failed payment

// ── Pagination ───────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;
