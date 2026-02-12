/**
 * Dynamic App Configuration
 * ──────────────────────────
 * Reads branding settings from the AppSettings database table.
 * Uses React cache() for request-level deduplication.
 * Falls back to siteConfig defaults if DB values are missing.
 */

import { cache } from "react";
import prisma from "@/lib/prisma";
import { siteConfig } from "@/lib/config";

export interface AppConfig {
  name: string;
  tagline: string;
  description: string;
  logoUrl: string | null;
}

/**
 * Fetch branding config from the database.
 * Cached per-request via React cache() — no duplicate DB hits
 * within the same server render.
 */
export const getAppConfig = cache(async (): Promise<AppConfig> => {
  try {
    const settings = await prisma.appSettings.findMany({
      where: {
        key: {
          in: ["site.name", "site.tagline", "site.description", "site.logoUrl"],
        },
      },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));

    return {
      name: (map.get("site.name") as string) ?? siteConfig.name,
      tagline: (map.get("site.tagline") as string) ?? siteConfig.tagline,
      description:
        (map.get("site.description") as string) ?? siteConfig.description,
      logoUrl: (map.get("site.logoUrl") as string) ?? null,
    };
  } catch (error) {
    console.error("Failed to fetch app config, using defaults:", error);
    return {
      name: siteConfig.name,
      tagline: siteConfig.tagline,
      description: siteConfig.description,
      logoUrl: null,
    };
  }
});
