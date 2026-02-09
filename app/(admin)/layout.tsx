/**
 * Admin Layout
 * ─────────────
 * Admin-only area with admin sidebar navigation.
 * Requires ADMIN role — non-admins are redirected to /dashboard.
 */

import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { siteConfig } from "@/lib/config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar navItems={siteConfig.adminNav} isAdmin />

      {/* Main content area */}
      <div className="md:pl-[250px] transition-all duration-300">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-6">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-3 md:pl-0 pl-12">
              <h1 className="text-lg font-semibold">Admin Panel</h1>
              <Badge variant="destructive" className="text-xs">
                Admin
              </Badge>
            </div>
            <UserMenu
              user={{
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                role: user.role,
              }}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
