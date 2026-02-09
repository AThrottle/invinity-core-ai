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

import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();

// Conditionally initialize Stripe (only if key is available)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
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

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
