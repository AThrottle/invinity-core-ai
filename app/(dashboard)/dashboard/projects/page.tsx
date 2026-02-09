/**
 * Projects Page (Example Feature)
 * ─────────────────────────────────
 * Demonstrates the extensible feature pattern:
 * - Server component fetches data
 * - Client component handles interactions
 * - Server actions handle mutations
 * - Plan limits are enforced
 *
 * CUSTOMIZATION: Replace "Projects" with your actual product feature.
 * This is the area where your "money feature" lives.
 */

import { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { ProjectsClient } from "@/components/dashboard/projects-client";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const user = await requireAuth();

  // Fetch user's projects
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Get plan limits for the UI
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    include: { plan: true },
  });

  const limits = subscription
    ? JSON.parse(subscription.plan.limits as string)
    : { projects: 1 };

  return (
    <ProjectsClient
      projects={projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      }))}
      projectLimit={limits.projects}
    />
  );
}
