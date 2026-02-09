/**
 * Centralized App Configuration
 * ─────────────────────────────
 * Level 1 Customization: Edit this file to rebrand the entire app.
 * No code changes needed beyond this file for basic branding.
 */

export const siteConfig = {
  // ── Branding ─────────────────────────────────
  name: "Infinity Core",
  tagline: "Build your SaaS in minutes, not months",
  description:
    "Production-ready SaaS boilerplate with auth, payments, admin panel, and AI-ready architecture.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // ── Social & Contact ─────────────────────────
  links: {
    twitter: "https://twitter.com/infinitycore",
    github: "https://github.com/infinitycore",
    docs: "/docs",
    support: "mailto:support@infinitycore.dev",
  },

  // ── SEO ──────────────────────────────────────
  ogImage: "/og-image.png",
  creator: "Infinity Core Team",

  // ── Navigation ───────────────────────────────
  mainNav: [
    { title: "Features", href: "/#features" },
    { title: "Pricing", href: "/pricing" },
    { title: "FAQ", href: "/#faq" },
  ],

  // ── Dashboard Sidebar ────────────────────────
  dashboardNav: [
    { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { title: "Projects", href: "/dashboard/projects", icon: "FolderOpen" },
    { title: "Settings", href: "/dashboard/settings", icon: "Settings" },
    { title: "Billing", href: "/dashboard/billing", icon: "CreditCard" },
  ],

  // ── Admin Sidebar ────────────────────────────
  adminNav: [
    { title: "Overview", href: "/admin", icon: "BarChart3" },
    { title: "Users", href: "/admin/users", icon: "Users" },
    { title: "Subscriptions", href: "/admin/subscriptions", icon: "CreditCard" },
    { title: "Settings", href: "/admin/config", icon: "Settings" },
  ],

  // ── Landing Page Content ─────────────────────
  features: [
    {
      title: "Authentication",
      description:
        "Email, Google, and GitHub login with email verification and password reset.",
      icon: "Shield",
    },
    {
      title: "Stripe Payments",
      description:
        "Subscription billing, checkout, customer portal, and webhook processing.",
      icon: "CreditCard",
    },
    {
      title: "Admin Panel",
      description:
        "User management, revenue analytics, subscription oversight, and app configuration.",
      icon: "LayoutDashboard",
    },
    {
      title: "AI-Ready",
      description:
        "Clean architecture designed for AI tools to read, understand, and extend.",
      icon: "Sparkles",
    },
    {
      title: "One-Click Deploy",
      description:
        "Deploy to Vercel with automated database migrations and environment setup.",
      icon: "Rocket",
    },
    {
      title: "Email System",
      description:
        "Branded transactional emails via Resend for welcome, verification, and billing.",
      icon: "Mail",
    },
  ],

  // ── FAQ ──────────────────────────────────────
  faq: [
    {
      question: "What is Infinity Core?",
      answer:
        "Infinity Core is a production-ready SaaS boilerplate that gives you authentication, payments, admin panel, and more out of the box. Clone, configure, deploy.",
    },
    {
      question: "How do I customize it for my product?",
      answer:
        "Start with Level 1 (edit config files for branding), then Level 2 (use AI prompts for content), then Level 3 (build your unique features).",
    },
    {
      question: "What payment methods are supported?",
      answer:
        "Stripe handles all payments, supporting credit cards, Apple Pay, Google Pay, and more depending on your region.",
    },
    {
      question: "Can I use my own domain?",
      answer:
        "Yes! Deploy to Vercel and configure your custom domain through their dashboard. SSL is automatic.",
    },
    {
      question: "Is there a free tier?",
      answer:
        "Yes, the Free plan includes basic features. Upgrade to Starter or Pro for advanced capabilities.",
    },
    {
      question: "How do I get support?",
      answer:
        "Free users get community support. Starter and Pro plans include email support. Enterprise gets dedicated support.",
    },
  ],

  // ── Plan Display Names ───────────────────────
  plans: {
    free: { name: "Free", badge: "default" as const },
    starter: { name: "Starter", badge: "secondary" as const },
    pro: { name: "Pro", badge: "default" as const },
    enterprise: { name: "Enterprise", badge: "destructive" as const },
  },
};

export type SiteConfig = typeof siteConfig;
