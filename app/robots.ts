/**
 * Robots.txt Generator
 * ─────────────────────
 * Controls search engine crawling behavior.
 * Next.js automatically serves this at /robots.txt.
 */

import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/admin/", "/setup/", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
