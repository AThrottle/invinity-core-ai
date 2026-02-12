/**
 * Marketing Layout
 * ────────────────
 * Public pages: landing page, pricing, etc.
 * Includes Navbar + Footer, no auth required.
 */

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getAppConfig } from "@/lib/app-config";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getAppConfig();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar appName={config.name} logoUrl={config.logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
