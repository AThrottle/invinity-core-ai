/**
 * Admin Subscription Management
 * ──────────────────────────────
 * Subscription list with status filters, revenue breakdown,
 * and failed payment visibility.
 */

import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { getSubscriptions, getRevenueByPlan } from "@/lib/admin/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Subscription Management",
};

interface PageProps {
  searchParams: { status?: string; page?: string };
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: PageProps) {
  await requireAdmin();

  const status = searchParams.status || "all";
  const page = parseInt(searchParams.page || "1", 10);

  const [subsData, revenueByPlan] = await Promise.all([
    getSubscriptions({ status: status !== "all" ? status : undefined, page }),
    getRevenueByPlan(),
  ]);

  const { subscriptions, total, pages, page: currentPage } = subsData;

  const statusFilters = ["all", "ACTIVE", "TRIALING", "PAST_DUE", "CANCELED"];

  const statusBadge: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
    ACTIVE: { label: "Active", variant: "success" },
    TRIALING: { label: "Trial", variant: "secondary" },
    PAST_DUE: { label: "Past Due", variant: "warning" },
    CANCELED: { label: "Canceled", variant: "destructive" },
    PAUSED: { label: "Paused", variant: "secondary" },
  };

  const totalMRR = revenueByPlan.reduce((sum, p) => sum + p.mrr, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Subscriptions</h2>
        <p className="text-muted-foreground">
          {total} total subscription{total !== 1 ? "s" : ""} &middot; MRR:{" "}
          {formatCurrency(totalMRR)}
        </p>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {revenueByPlan
          .filter((p) => p.price > 0)
          .map((plan) => (
            <Card key={plan.slug}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {plan.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(plan.mrr)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.subscribers} subscriber{plan.subscribers !== 1 ? "s" : ""}{" "}
                  &times; {formatCurrency(plan.price)}/mo
                </p>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((s) => (
          <Link
            key={s}
            href={`/admin/subscriptions?status=${s}${page > 1 ? "" : ""}`}
          >
            <Button
              variant={status === s ? "default" : "outline"}
              size="sm"
              className="capitalize"
            >
              {s === "all" ? "All" : s.replace("_", " ").toLowerCase()}
            </Button>
          </Link>
        ))}
      </div>

      {/* Subscription Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Plan</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">MRR</th>
                  <th className="text-left p-3 font-medium">Period End</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No subscriptions found.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => {
                    const badge =
                      statusBadge[sub.status] || statusBadge.ACTIVE;
                    return (
                      <tr
                        key={sub.id}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="p-3">
                          <div>
                            <p className="font-medium">
                              {sub.user.name || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sub.user.email}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {sub.plan.name}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={badge.variant} className="text-xs">
                            {badge.label}
                          </Badge>
                          {sub.cancelAtPeriodEnd && (
                            <span className="text-xs text-muted-foreground ml-1">
                              (canceling)
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-medium">
                          {formatCurrency(sub.plan.price)}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {sub.currentPeriodEnd
                            ? formatDate(sub.currentPeriodEnd)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {pages}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/admin/subscriptions?status=${status}&page=${currentPage - 1}`}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href={`/admin/subscriptions?status=${status}&page=${currentPage + 1}`}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
