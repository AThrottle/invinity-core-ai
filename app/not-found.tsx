/**
 * Custom 404 Page
 * ────────────────
 * Shown when a user navigates to a non-existent route.
 * Professional, branded, with a link back to home.
 */

import Link from "next/link";
import { Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Infinity className="h-12 w-12 text-primary mb-6" />
      <h1 className="text-6xl font-bold mb-2">404</h1>
      <h2 className="text-xl font-semibold mb-4">Page not found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
