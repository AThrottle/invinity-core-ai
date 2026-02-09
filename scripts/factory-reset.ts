/**
 * Factory Reset Script
 * ─────────────────────
 * Run with: npm run factory-reset
 *
 * Returns the app to a pristine state:
 * 1. Clears all user data (users, subscriptions, usage, projects)
 * 2. Preserves plans and app settings (schema + seed data)
 * 3. Re-seeds default data
 *
 * Use cases:
 * - Starting fresh after testing
 * - Preparing for a demo
 * - Template redistribution
 *
 * WARNING: This is destructive. All user data will be permanently deleted.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("");
  console.log("⚠️  FACTORY RESET — Infinity Core Engine");
  console.log("─".repeat(45));
  console.log("This will DELETE all user data and reset the app.");
  console.log("");

  // ── Clear user-generated data ────────────
  console.log("🗑  Clearing data...\n");

  // Order matters — delete children before parents
  const deletions = await Promise.all([
    prisma.apiUsage.deleteMany(),
    prisma.project.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.waitList.deleteMany(),
  ]);

  console.log(`  ✓ API usage records: ${deletions[0].count} deleted`);
  console.log(`  ✓ Projects: ${deletions[1].count} deleted`);
  console.log(`  ✓ Subscriptions: ${deletions[2].count} deleted`);
  console.log(`  ✓ Waitlist entries: ${deletions[3].count} deleted`);

  // Delete users last (after all FK references are gone)
  const usersDeleted = await prisma.user.deleteMany();
  console.log(`  ✓ Users: ${usersDeleted.count} deleted`);

  // ── Reset auto-increment / sequences if needed ──
  // PostgreSQL handles this automatically with UUIDs

  // ── Clear Stripe price IDs from plans ────
  // (User should re-run seed to sync with their Stripe account)
  await prisma.plan.updateMany({
    data: {
      stripePriceId: null,
      stripeProductId: null,
    },
  });
  console.log("  ✓ Stripe IDs cleared from plans");

  // ── Reset app settings to defaults ───────
  const defaultSettings: Record<string, any> = {
    "site.name": "Infinity Core",
    "site.tagline": "Build your SaaS in minutes, not months",
    "site.description":
      "Production-ready SaaS boilerplate with auth, payments, admin panel, and AI-ready architecture.",
    "feature.waitlist": false,
    "feature.maintenance": false,
    "feature.ai_writer": true,
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.appSettings.upsert({
      where: { key },
      update: { value, updatedBy: null },
      create: { key, value, description: null },
    });
  }
  console.log("  ✓ App settings reset to defaults");

  console.log("\n✅ Factory reset complete!");
  console.log("\nNext steps:");
  console.log("  1. Run `npm run db:seed` to re-seed plans with Stripe");
  console.log("  2. Restart the dev server: `npm run dev`");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Factory reset failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
