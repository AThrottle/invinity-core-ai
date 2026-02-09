/**
 * Admin Data Queries
 * ───────────────────
 * Server-side data fetching for the admin panel.
 * All functions assume the caller has already verified admin access.
 *
 * These are pure data functions — no auth checks inside.
 * Auth is enforced at the layout/page level via requireAdmin().
 */

import prisma from "@/lib/prisma";

// ── Dashboard KPIs ───────────────────────────

export async function getAdminKPIs() {
  const [
    totalUsers,
    activeSubscriptions,
    allSubscriptions,
    recentSignups,
    pastDueCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.findMany({
      where: { status: { in: ["ACTIVE", "TRIALING"] } },
      include: { plan: true },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
        },
      },
    }),
    prisma.subscription.count({ where: { status: "PAST_DUE" } }),
  ]);

  // Calculate MRR from active subscriptions
  const mrr = allSubscriptions.reduce((sum, sub) => sum + sub.plan.price, 0);

  // Calculate churn (canceled in last 30 days vs total)
  const canceledRecently = await prisma.subscription.count({
    where: {
      status: "CANCELED",
      updatedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const totalEverSubscribed = await prisma.subscription.count();
  const churnRate =
    totalEverSubscribed > 0
      ? ((canceledRecently / totalEverSubscribed) * 100).toFixed(1)
      : "0.0";

  return {
    totalUsers,
    activeSubscriptions,
    mrr,
    churnRate,
    recentSignups,
    pastDueCount,
  };
}

// ── Recent Activity ──────────────────────────

export async function getRecentActivity(limit = 10) {
  // Recent signups
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  // Recent subscription changes
  const recentSubs = await prisma.subscription.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      user: { select: { email: true } },
      plan: { select: { name: true } },
    },
  });

  // Merge and sort by date
  const activities = [
    ...recentUsers.map((u) => ({
      type: "signup" as const,
      description: `New signup: ${u.email}`,
      date: u.createdAt,
    })),
    ...recentSubs.map((s) => ({
      type: "subscription" as const,
      description: `${s.user.email} — ${s.plan.name} (${s.status})`,
      date: s.updatedAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);

  return activities;
}

// ── User Management ──────────────────────────

export async function getUsers({
  search,
  page = 1,
  perPage = 10,
  planFilter,
}: {
  search?: string;
  page?: number;
  perPage?: number;
  planFilter?: string;
}) {
  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  if (planFilter && planFilter !== "all") {
    where.subscription = {
      plan: { slug: planFilter },
    };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        subscription: {
          include: { plan: { select: { name: true, slug: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    pages: Math.ceil(total / perPage),
    page,
  };
}

// ── Subscription Management ──────────────────

export async function getSubscriptions({
  status,
  page = 1,
  perPage = 10,
}: {
  status?: string;
  page?: number;
  perPage?: number;
}) {
  const where: any = {};

  if (status && status !== "all") {
    where.status = status;
  }

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: {
        user: { select: { email: true, name: true } },
        plan: { select: { name: true, slug: true, price: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.subscription.count({ where }),
  ]);

  return {
    subscriptions,
    total,
    pages: Math.ceil(total / perPage),
    page,
  };
}

// ── Revenue Breakdown ────────────────────────

export async function getRevenueByPlan() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    include: {
      subscriptions: {
        where: { status: { in: ["ACTIVE", "TRIALING"] } },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return plans.map((plan) => ({
    name: plan.name,
    slug: plan.slug,
    price: plan.price,
    subscribers: plan.subscriptions.length,
    mrr: plan.subscriptions.length * plan.price,
  }));
}

// ── Waitlist ─────────────────────────────────

export async function getWaitlist({
  page = 1,
  perPage = 20,
}: {
  page?: number;
  perPage?: number;
}) {
  const [entries, total] = await Promise.all([
    prisma.waitList.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.waitList.count(),
  ]);

  return { entries, total, pages: Math.ceil(total / perPage), page };
}
