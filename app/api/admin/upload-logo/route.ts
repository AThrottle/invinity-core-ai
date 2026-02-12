/**
 * Logo Upload API
 * ────────────────
 * POST /api/admin/upload-logo
 *
 * Accepts a multipart form with a "logo" file field.
 * Saves to public/uploads/logo-{timestamp}.{ext}
 * Updates the site.logoUrl AppSetting in the database.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  // Auth check
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Parse multipart form
  const formData = await request.formData();
  const file = formData.get("logo") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: PNG, JPEG, WebP, SVG" },
      { status: 400 }
    );
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size: 2MB" },
      { status: 400 }
    );
  }

  try {
    // Save file
    const ext = extname(file.name) || ".png";
    const filename = `logo-${Date.now()}${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(join(uploadDir, filename), buffer);

    // Update DB
    const logoUrl = `/uploads/${filename}`;
    await prisma.appSettings.upsert({
      where: { key: "site.logoUrl" },
      update: { value: logoUrl, updatedBy: session.id },
      create: {
        key: "site.logoUrl",
        value: logoUrl,
        description: "Logo image URL",
        updatedBy: session.id,
      },
    });

    // Revalidate all layouts so the logo appears everywhere
    revalidatePath("/", "layout");

    return NextResponse.json({ url: logoUrl });
  } catch (error: any) {
    console.error("Logo upload failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload logo" },
      { status: 500 }
    );
  }
}
