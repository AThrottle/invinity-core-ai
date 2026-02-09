/**
 * Project Server Actions
 * ───────────────────────
 * CRUD operations for the example Project feature.
 *
 * This file demonstrates the pattern for building features:
 * 1. Validate the user is authenticated
 * 2. Validate input with basic checks
 * 3. Check plan limits before creating
 * 4. Perform the database operation
 * 5. Revalidate the page cache
 *
 * Replace "Project" with your actual feature model.
 */

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// ── Create Project ───────────────────────────

export async function createProject(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name || name.trim().length < 1) {
    return { error: "Project name is required." };
  }

  // Check plan limits
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.id },
    include: { plan: true },
  });

  const limits = subscription
    ? JSON.parse(subscription.plan.limits as string)
    : { projects: 1 };

  if (limits.projects !== -1) {
    const currentCount = await prisma.project.count({
      where: { userId: session.id },
    });

    if (currentCount >= limits.projects) {
      return {
        error: `You've reached your limit of ${limits.projects} project(s). Upgrade your plan for more.`,
      };
    }
  }

  try {
    const project = await prisma.project.create({
      data: {
        userId: session.id,
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    revalidatePath("/dashboard/projects");
    return { success: "Project created!", projectId: project.id };
  } catch (error: any) {
    return { error: error.message || "Failed to create project." };
  }
}

// ── Update Project ───────────────────────────

export async function updateProject(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;

  if (!id) return { error: "Project ID is required." };
  if (!name || name.trim().length < 1) {
    return { error: "Project name is required." };
  }

  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id, userId: session.id },
  });

  if (!project) return { error: "Project not found." };

  try {
    await prisma.project.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        status: (status as any) || "ACTIVE",
      },
    });

    revalidatePath("/dashboard/projects");
    return { success: "Project updated!" };
  } catch (error: any) {
    return { error: error.message || "Failed to update project." };
  }
}

// ── Delete Project ───────────────────────────

export async function deleteProject(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const id = formData.get("id") as string;
  if (!id) return { error: "Project ID is required." };

  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id, userId: session.id },
  });

  if (!project) return { error: "Project not found." };

  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath("/dashboard/projects");
    return { success: "Project deleted." };
  } catch (error: any) {
    return { error: error.message || "Failed to delete project." };
  }
}
