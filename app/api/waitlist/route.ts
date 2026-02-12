/**
 * Waitlist API
 * ─────────────
 * POST /api/waitlist
 * Body: { email: string, source?: string }
 *
 * Captures email signups for the waitlist.
 * Used when the waitlist feature flag is enabled.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  source: z.string().optional().default("landing_page"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source } = schema.parse(body);

    // Check for duplicate
    const existing = await prisma.waitList.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You're already on the list!" },
        { status: 200 }
      );
    }

    await prisma.waitList.create({
      data: { email, source },
    });

    return NextResponse.json(
      { message: "You're on the list! We'll notify you when we launch." },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to join waitlist." },
      { status: 500 }
    );
  }
}
