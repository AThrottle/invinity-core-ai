/**
 * API Route Utilities
 * ────────────────────
 * Consistent error handling and response helpers for API routes.
 * Use these in every route handler for uniform error responses.
 *
 * Usage:
 *   import { apiSuccess, apiError, withErrorHandler } from "@/lib/api-utils";
 *
 *   export const POST = withErrorHandler(async (req) => {
 *     const data = await doSomething();
 *     return apiSuccess(data);
 *   });
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Standard success response.
 */
export function apiSuccess(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Standard error response with consistent format.
 */
export function apiError(message: string, status = 500) {
  return NextResponse.json(
    {
      error: message,
      status,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Wraps an API route handler with automatic error catching.
 * Prevents unhandled errors from returning 500 with no body.
 */
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error: any) {
      console.error(`API Error [${request.method} ${request.url}]:`, error);

      // Known error types
      if (error.message?.includes("Not authenticated")) {
        return apiError("Authentication required", 401);
      }
      if (error.message?.includes("Not authorized")) {
        return apiError("Insufficient permissions", 403);
      }

      // Generic server error
      return apiError(
        process.env.NODE_ENV === "development"
          ? error.message || "Internal server error"
          : "Internal server error",
        500
      );
    }
  };
}
