"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Users,
  BarChart3,
  FolderOpen,
  Infinity,
  Menu,
  X,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { signOut } from "@/lib/auth/actions";

// Map icon names to components
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Settings,
  CreditCard,
  Users,
  BarChart3,
  FolderOpen,
};

interface SidebarProps {
  navItems: { title: string; href: string; icon: string }[];
  isAdmin?: boolean;
  appName?: string;
  logoUrl?: string | null;
}

export function Sidebar({ navItems, isAdmin = false, appName, logoUrl }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-background border rounded-md p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-background border-r transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[250px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link href="/" className="flex items-center space-x-2">
              {logoUrl ? (
                <img src={logoUrl} alt={appName || siteConfig.name} className="h-6 w-6 object-contain shrink-0" />
              ) : (
                <Infinity className="h-6 w-6 text-primary shrink-0" />
              )}
              {!collapsed && (
                <span className="text-lg font-bold">{appName || siteConfig.name}</span>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:block text-muted-foreground hover:text-foreground"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "rotate-180"
                )}
              />
            </button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {isAdmin && !collapsed && (
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin
                </p>
              )}
              {navItems.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    item.href !== "/admin" &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="ml-3">{item.title}</span>}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-3">
            <Separator className="mb-3" />
            <Button
              variant="ghost"
              className={cn(
                "w-full text-muted-foreground hover:text-foreground",
                collapsed ? "justify-center px-2" : "justify-start"
              )}
              title="Sign out"
              onClick={async () => {
                await signOut();
              }}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="ml-3">Sign out</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
