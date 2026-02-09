/**
 * Next.js Middleware
 * ──────────────────
 * Runs on every request. Responsibilities:
 *
 * 1. Setup detection — redirect to /setup if app isn't configured
 * 2. Supabase session refresh — keeps auth tokens alive
 * 3. Route protection — block unauthenticated access to /dashboard/*
 * 4. Admin enforcement — block non-admin access to /admin/*
 * 5. Auth redirect — redirect authenticated users away from /login, /signup
 */

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isSetupComplete } from "@/lib/setup";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Setup Detection ─────────────────────
  const isSetupRoute = pathname.startsWith("/setup");
  const isApiRoute = pathname.startsWith("/api");
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

  if (!isSetupRoute && !isApiRoute && !isStaticAsset) {
    if (!isSetupComplete()) {
      return NextResponse.redirect(new URL("/setup", request.url));
    }
  }

  // ── 2. Supabase Session Refresh ────────────
  // Skip if Supabase isn't configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── 3. Route Protection ────────────────────
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/reset-password";

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── 4. Admin Enforcement ───────────────────
  // Note: Full admin role check requires DB lookup.
  // For now, middleware handles auth. Role check happens in page components
  // via requireAdmin() from lib/auth/session.ts.

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
