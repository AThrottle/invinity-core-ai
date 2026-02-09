/**
 * Dashboard Home Page
 * ────────────────────
 * Overview with real KPI data pulled from the database:
 * - Current plan and subscription status
 * - API usage against plan limits
 * - Quick action buttons
 * - Welcome banner for new users
 */

import { Metadata } from "next";
import Link from "next/link";
import {
  CreditCard,
  Activity,
  FolderOpen,
  Zap,
  ArrowRight,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireAuth();

  // Fetch subscription with plan
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    include: { plan: true },
  });

  // Fetch total API usage for this period
  const usageAgg = await prisma.apiUsage.aggregate({
    where: { userId: user.id },
    _sum: { count: true },
  });
  const totalUsage = usageAgg._sum.count || 0;

  // Plan details
  const planName = subscription?.plan.name || "Free";
  const planSlug = subscription?.plan.slug || "free";
  const planLimits = subscription
    ? JSON.parse(subscription.plan.limits as string)
    : { apiCalls: 100, projects: 1 };
  const apiLimit = planLimits.apiCalls === -1 ? "Unlimited" : planLimits.apiCalls;

  // Determine if user is new (created within last 24 hours)
  const isNewUser =
    Date.now() - new Date(user.createdAt).getTime() < 24 * 60 * 60 * 1000;

  // Stats for the KPI cards
  const stats = [
    {
      title: "Current Plan",
      value: planName,
      description:
        subscription?.status === "ACTIVE"
          ? `Renews ${subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : "soon"}`
          : planSlug === "free"
          ? "Upgrade for more features"
          : `Status: ${subscription?.status || "None"}`,
      icon: CreditCard,
      href: ROUTES.BILLING,
    },
    {
      title: "API Usage",
      value:
        apiLimit === "Unlimited"
          ? `${totalUsage}`
          : `${totalUsage} / ${apiLimit}`,
      description:
        apiLimit === "Unlimited"
          ? "Unlimited calls this month"
          : `${Math.max(0, (apiLimit as number) - totalUsage)} calls remaining`,
      icon: Activity,
      href: ROUTES.DASHBOARD,
    },
    {
      title: "Projects",
      value: planLimits.projects === -1 ? "Unlimited" : `${planLimits.projects}`,
      description:
        planLimits.projects === -1
          ? "No project limit"
          : `${planLimits.projects} project${planLimits.projects !== 1 ? "s" : ""} allowed`,
      icon: FolderOpen,
      href: "/dashboard/projects",
    },
    {
      title: "Account Status",
      value:
        subscription?.status === "ACTIVE"
          ? "Active"
          : subscription?.status === "TRIALING"
          ? "Trial"
          : subscription?.status === "PAST_DUE"
          ? "Past Due"
          : "Active",
      description:
        subscription?.status === "PAST_DUE"
          ? "Please update your payment method"
          : "Account in good standing",
      icon: Zap,
      href: ROUTES.SETTINGS,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner — shown to new users */}
      {isNewUser && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">
              Welcome, {user.name?.split(" ")[0] || "there"}!
            </CardTitle>
            <CardDescription className="text-base">
              Your account is set up and ready to go. Here are a few things to
              get started:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href={ROUTES.SETTINGS}>
                <div className="flex items-center gap-2 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Complete your profile</span>
                </div>
              </Link>
              <Link href={ROUTES.BILLING}>
                <div className="flex items-center gap-2 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Explore plans</span>
                </div>
              </Link>
              <Link href="/dashboard/projects">
                <div className="flex items-center gap-2 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Create a project</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past due warning */}
      {subscription?.status === "PAST_DUE" && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Your payment failed. Please update your payment method to keep
              your subscription active.
            </p>
            <Link href={ROUTES.BILLING}>
              <Button size="sm" variant="outline">
                Update Payment
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={ROUTES.SETTINGS}>
              <Button variant="ghost" className="w-full justify-between">
                Edit Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={ROUTES.BILLING}>
              <Button variant="ghost" className="w-full justify-between">
                {planSlug === "free" ? "Upgrade Plan" : "Manage Subscription"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/projects">
              <Button variant="ghost" className="w-full justify-between">
                View Projects
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user.name || "Not set"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role</span>
              <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"} className="text-xs">
                {user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
