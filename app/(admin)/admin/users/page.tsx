/**
 * Admin User Management
 * ──────────────────────
 * Searchable, filterable user table with:
 * - Search by email or name
 * - Filter by plan
 * - Pagination
 * - Role change via dropdown
 */

import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { getUsers } from "@/lib/admin/queries";
import { AdminUsersClient } from "@/components/admin/users-client";

export const metadata: Metadata = {
  title: "User Management",
};

interface PageProps {
  searchParams: { search?: string; page?: string; plan?: string };
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireAdmin();

  const search = searchParams.search || "";
  const page = parseInt(searchParams.page || "1", 10);
  const planFilter = searchParams.plan || "all";

  const { users, total, pages } = await getUsers({
    search: search || undefined,
    page,
    perPage: 10,
    planFilter: planFilter !== "all" ? planFilter : undefined,
  });

  return (
    <AdminUsersClient
      users={users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        avatarUrl: u.avatarUrl,
        plan: u.subscription?.plan.name || "Free",
        planSlug: u.subscription?.plan.slug || "free",
        status: u.subscription?.status || null,
        createdAt: u.createdAt.toISOString(),
      }))}
      total={total}
      pages={pages}
      currentPage={page}
      search={search}
      planFilter={planFilter}
    />
  );
}
