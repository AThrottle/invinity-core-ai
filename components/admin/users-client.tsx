/**
 * Admin Users Client Component
 * ──────────────────────────────
 * Interactive user management table with search, filters,
 * pagination, and role-change functionality.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { changeUserRole } from "@/lib/admin/actions";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
  plan: string;
  planSlug: string;
  status: string | null;
  createdAt: string;
}

interface AdminUsersClientProps {
  users: UserRow[];
  total: number;
  pages: number;
  currentPage: number;
  search: string;
  planFilter: string;
}

export function AdminUsersClient({
  users,
  total,
  pages,
  currentPage,
  search,
  planFilter,
}: AdminUsersClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState(search);
  const [loading, setLoading] = useState<string | null>(null);

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.search) sp.set("search", params.search);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    if (params.plan && params.plan !== "all") sp.set("plan", params.plan);
    router.push(`/admin/users?${sp.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: searchValue, page: "1", plan: planFilter });
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setLoading(userId);
    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("role", newRole);

    const result = await changeUserRole(formData);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: result.success, variant: "success" });
    }
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-muted-foreground">
          {total} total user{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        <div className="flex gap-2">
          {["all", "free", "starter", "pro", "enterprise"].map((plan) => (
            <Button
              key={plan}
              variant={planFilter === plan ? "default" : "outline"}
              size="sm"
              onClick={() =>
                navigate({
                  search: searchValue,
                  page: "1",
                  plan,
                })
              }
              className="capitalize"
            >
              {plan}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Plan</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Joined</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const initials = user.name
                      ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                      : user.email[0].toUpperCase();

                    return (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{user.name || "—"}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {user.plan}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={user.role === "ADMIN" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="p-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={loading === user.id}
                              >
                                {loading === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Role"
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user.id, "USER")}
                              >
                                <User className="mr-2 h-4 w-4" />
                                Set as User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user.id, "ADMIN")}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Set as Admin
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() =>
                navigate({
                  search: searchValue,
                  page: String(currentPage - 1),
                  plan: planFilter,
                })
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pages}
              onClick={() =>
                navigate({
                  search: searchValue,
                  page: String(currentPage + 1),
                  plan: planFilter,
                })
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
