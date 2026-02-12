import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/lib/config";
import { getAppConfig } from "@/lib/app-config";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const config = await getAppConfig();

  return {
    title: {
      default: config.name,
      template: `%s | ${config.name}`,
    },
    description: config.description,
    keywords: ["SaaS", "boilerplate", "Next.js", "Stripe", "Supabase"],
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteConfig.url,
      title: config.name,
      description: config.description,
      siteName: config.name,
    },
    twitter: {
      card: "summary_large_image",
      title: config.name,
      description: config.description,
      creator: "@infinitycore",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
