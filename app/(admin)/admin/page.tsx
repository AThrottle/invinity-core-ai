/**
 * Admin Dashboard
 * ────────────────
 * Business metrics at a glance:
 * - KPI cards with real data (users, MRR, subs, churn)
 * - Revenue breakdown by plan
 * - Recent activity feed
 */

import { Metadata } from "next";
import {
  Users,
  CreditCard,
  DollarSign,
  TrendingDown,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminKPIs, getRecentActivity, getRevenueByPlan } from "@/lib/admin/queries";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [kpis, activity, revenueByPlan] = await Promise.all([
    getAdminKPIs(),
    getRecentActivity(8),
    getRevenueByPlan(),
  ]);

  const kpiCards = [
    {
      title: "Total Users",
      value: kpis.totalUsers.toLocaleString(),
      detail: `${kpis.recentSignups} new this week`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Subscriptions",
      value: kpis.activeSubscriptions.toLocaleString(),
      detail: kpis.pastDueCount > 0 ? `${kpis.pastDueCount} past due` : "All healthy",
      icon: CreditCard,
      color: "text-emerald-600",
    },
    {
      title: "Monthly Revenue (MRR)",
      value: formatCurrency(kpis.mrr),
      detail: `From ${kpis.activeSubscriptions} subscribers`,
      icon: DollarSign,
      color: "text-violet-600",
    },
    {
      title: "Churn Rate",
      value: `${kpis.churnRate}%`,
      detail: "Last 30 days",
      icon: TrendingDown,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Overview</h2>
        <p className="text-muted-foreground">
          Business metrics and system health at a glance.
        </p>
      </div>

      {/* Past due alert */}
      {kpis.pastDueCount > 0 && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>{kpis.pastDueCount}</strong> subscription{kpis.pastDueCount !== 1 ? "s" : ""}{" "}
              with past-due payments. Review in the Subscriptions tab.
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
            <CardDescription>MRR breakdown across plans</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueByPlan.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active plans.</p>
            ) : (
              <div className="space-y-4">
                {revenueByPlan.map((plan) => {
                  const percentage =
                    kpis.mrr > 0
                      ? Math.round((plan.mrr / kpis.mrr) * 100)
                      : 0;
                  return (
                    <div key={plan.slug} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{plan.name}</span>
                        <span className="text-muted-foreground">
                          {plan.subscribers} subs &middot;{" "}
                          {formatCurrency(plan.mrr)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest signups and subscription changes</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {activity.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2 border-b pb-3 last:border-0"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      {item.type === "signup" ? (
                        <UserPlus className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <CreditCard className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      )}
                      <span className="text-sm truncate">{item.description}</span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(item.date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Format a date as relative time (e.g., "2h ago", "3d ago") */
function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
