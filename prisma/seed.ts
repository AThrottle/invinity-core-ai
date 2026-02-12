/**
 * Database Seed Script
 * ─────────────────────
 * Run with: npm run db:seed
 *
 * Seeds the database with:
 * - Default subscription plans (Free, Starter, Pro, Enterprise)
 * - Default app settings
 *
 * If STRIPE_SECRET_KEY is set, also creates matching Products
 * and Prices in Stripe and stores their IDs in the database.
 */

import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Conditionally initialize Stripe (only if key is available)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
    })
  : null;

interface PlanSeed {
  name: string;
  slug: string;
  price: number;
  interval: "MONTH" | "YEAR";
  features: string;
  limits: string;
  isActive: boolean;
  sortOrder: number;
}

const plans: PlanSeed[] = [
  {
    name: "Free",
    slug: "free",
    price: 0,
    interval: "MONTH",
    features: JSON.stringify([
      "1 Project",
      "100 API calls/month",
      "Community support",
      "Basic analytics",
    ]),
    limits: JSON.stringify({ projects: 1, apiCalls: 100, storage: 100 }),
    isActive: true,
    sortOrder: 0,
  },
  {
    name: "Starter",
    slug: "starter",
    price: 1900,
    interval: "MONTH",
    features: JSON.stringify([
      "5 Projects",
      "1,000 API calls/month",
      "Email support",
      "Advanced analytics",
      "Custom domain",
    ]),
    limits: JSON.stringify({ projects: 5, apiCalls: 1000, storage: 1000 }),
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Pro",
    slug: "pro",
    price: 4900,
    interval: "MONTH",
    features: JSON.stringify([
      "Unlimited Projects",
      "10,000 API calls/month",
      "Priority support",
      "Advanced analytics",
      "Custom domain",
      "API access",
      "Team collaboration",
    ]),
    limits: JSON.stringify({ projects: -1, apiCalls: 10000, storage: 10000 }),
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    price: 9900,
    interval: "MONTH",
    features: JSON.stringify([
      "Unlimited everything",
      "Unlimited API calls",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "White-label option",
      "Priority feature requests",
    ]),
    limits: JSON.stringify({ projects: -1, apiCalls: -1, storage: -1 }),
    isActive: true,
    sortOrder: 3,
  },
];

async function syncPlanWithStripe(plan: PlanSeed) {
  if (!stripe || plan.price === 0) return { productId: null, priceId: null };

  try {
    // Create or find the Stripe Product
    const existingProducts = await stripe.products.search({
      query: `metadata["slug"]:"${plan.slug}"`,
    });

    let product: Stripe.Product;

    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log(`  ↻ Stripe product exists: ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: plan.name,
        description: `${plan.name} plan subscription`,
        metadata: { slug: plan.slug },
      });
      console.log(`  + Stripe product created: ${product.id}`);
    }

    // Create or find the Stripe Price
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
    });

    const matchingPrice = existingPrices.data.find(
      (p) =>
        p.unit_amount === plan.price &&
        p.recurring?.interval === plan.interval.toLowerCase()
    );

    let price: Stripe.Price;

    if (matchingPrice) {
      price = matchingPrice;
      console.log(`  ↻ Stripe price exists: ${price.id}`);
    } else {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: "usd",
        recurring: {
          interval: plan.interval.toLowerCase() as "month" | "year",
        },
        metadata: { slug: plan.slug },
      });
      console.log(`  + Stripe price created: ${price.id}`);
    }

    return { productId: product.id, priceId: price.id };
  } catch (error: any) {
    console.error(`  ✗ Stripe sync failed for ${plan.name}:`, error.message);
    return { productId: null, priceId: null };
  }
}

async function main() {
  console.log("🌱 Seeding database...\n");

  if (stripe) {
    console.log("📡 Stripe connected — will sync products and prices\n");
  } else {
    console.log("⚠  STRIPE_SECRET_KEY not set — skipping Stripe sync\n");
  }

  // ── Seed Plans ───────────────────────────────
  for (const plan of plans) {
    const { productId, priceId } = await syncPlanWithStripe(plan);

    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        ...plan,
        stripeProductId: productId,
        stripePriceId: priceId,
      },
      create: {
        ...plan,
        stripeProductId: productId,
        stripePriceId: priceId,
      },
    });

    const priceLabel =
      plan.price === 0
        ? "Free"
        : `$${(plan.price / 100).toFixed(2)}/mo`;
    console.log(`  ✓ Plan: ${plan.name} (${priceLabel})`);
  }

  // ── Seed App Settings ────────────────────────
  console.log("");
  const settings = [
    {
      key: "site.name",
      value: JSON.stringify("Infinity Core"),
      description: "Application name displayed in navbar and titles",
    },
    {
      key: "site.tagline",
      value: JSON.stringify("Build your SaaS in minutes, not months"),
      description: "Tagline shown on landing page hero section",
    },
    {
      key: "site.description",
      value: JSON.stringify(
        "Production-ready SaaS boilerplate with auth, payments, admin panel, and AI-ready architecture."
      ),
      description: "SEO meta description",
    },
    {
      key: "feature.waitlist",
      value: JSON.stringify(false),
      description: "Enable waitlist mode (disables signups, shows waitlist form)",
    },
    {
      key: "feature.maintenance",
      value: JSON.stringify(false),
      description: "Enable maintenance mode (shows maintenance page to non-admins)",
    },
    {
      key: "feature.ai_writer",
      value: JSON.stringify(true),
      description: "Enable AI Writer feature (requires Pro plan)",
    },
  ];

  for (const setting of settings) {
    await prisma.appSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting,
    });
    console.log(`  ✓ Setting: ${setting.key}`);
  }

  // ── Seed Test Accounts ──────────────────────
  console.log("");
  await seedTestAccounts();

  console.log("\n✅ Seed complete!");
}

/**
 * Create test admin and user accounts in Supabase Auth + Prisma.
 * These allow immediate testing without email verification.
 */
async function seedTestAccounts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.log("  ⚠ Supabase credentials not set — skipping test accounts");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const testAccounts = [
    {
      email: "admin@test.com",
      password: "Admin123!",
      name: "Test Admin",
      role: "ADMIN" as const,
    },
    {
      email: "user@test.com",
      password: "User123!",
      name: "Test User",
      role: "USER" as const,
    },
  ];

  for (const account of testAccounts) {
    try {
      // Check if Prisma user already exists
      const existing = await prisma.user.findUnique({
        where: { email: account.email },
      });
      if (existing) {
        console.log(`  ↻ Account exists: ${account.email} (${account.role})`);
        continue;
      }

      // Create Supabase Auth user (email pre-confirmed)
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: { full_name: account.name },
        });

      if (authError) {
        // User may exist in Auth but not in Prisma — try to fetch
        if (authError.message?.includes("already been registered")) {
          const { data: listData } = await supabase.auth.admin.listUsers();
          const authUser = listData?.users?.find(
            (u) => u.email === account.email
          );
          if (authUser) {
            await prisma.user.upsert({
              where: { email: account.email },
              update: { role: account.role, name: account.name },
              create: {
                id: authUser.id,
                email: account.email,
                name: account.name,
                role: account.role,
                emailVerified: true,
              },
            });
            console.log(
              `  ✓ Account synced: ${account.email} (${account.role})`
            );
          } else {
            console.error(
              `  ✗ Auth user exists but not found: ${account.email}`
            );
          }
          continue;
        }
        console.error(
          `  ✗ Failed to create ${account.email}:`,
          authError.message
        );
        continue;
      }

      // Create Prisma user record linked to Supabase Auth UID
      await prisma.user.create({
        data: {
          id: authData.user.id,
          email: account.email,
          name: account.name,
          role: account.role,
          emailVerified: true,
        },
      });

      console.log(`  ✓ Account created: ${account.email} (${account.role})`);
    } catch (error: any) {
      console.error(`  ✗ Error creating ${account.email}:`, error.message);
    }
  }

  // ── Assign Free plan to test user ──────────
  try {
    const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });
    const testUser = await prisma.user.findUnique({
      where: { email: "user@test.com" },
      include: { subscription: true },
    });

    if (freePlan && testUser && !testUser.subscription) {
      await prisma.subscription.create({
        data: {
          userId: testUser.id,
          planId: freePlan.id,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ),
        },
      });
      console.log(`  ✓ Free plan assigned to user@test.com`);
    }
  } catch (error: any) {
    console.error("  ✗ Error assigning Free plan:", error.message);
  }

  // ── Assign Pro plan to admin ───────────────
  try {
    const proPlan = await prisma.plan.findUnique({ where: { slug: "pro" } });
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@test.com" },
      include: { subscription: true },
    });

    if (proPlan && adminUser && !adminUser.subscription) {
      await prisma.subscription.create({
        data: {
          userId: adminUser.id,
          planId: proPlan.id,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ),
        },
      });
      console.log(`  ✓ Pro plan assigned to admin@test.com`);
    }
  } catch (error: any) {
    console.error("  ✗ Error assigning Pro plan:", error.message);
  }

  console.log("");
  console.log("  ┌──────────────────────────────────────────┐");
  console.log("  │         TEST ACCOUNT CREDENTIALS          │");
  console.log("  ├──────────────────────────────────────────┤");
  console.log("  │  Admin:  admin@test.com / Admin123!       │");
  console.log("  │  User:   user@test.com  / User123!        │");
  console.log("  └──────────────────────────────────────────┘");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
