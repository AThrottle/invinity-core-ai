/**
 * Dashboard Layout
 * ─────────────────
 * Protected member area with sidebar navigation.
 * Auth is enforced by middleware (redirects to /login if unauthenticated).
 * This layout fetches the user to display their info in the header.
 */

import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { getUser } from "@/lib/auth/session";
import { siteConfig } from "@/lib/config";
import { ROUTES } from "@/lib/constants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // Fallback redirect if middleware didn't catch it
  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar navItems={siteConfig.dashboardNav} />

      {/* Main content area — offset by sidebar width */}
      <div className="md:pl-[250px] transition-all duration-300">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-6">
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-semibold md:pl-0 pl-12">Dashboard</h1>
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
