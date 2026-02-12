"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { ROUTES } from "@/lib/constants";

interface NavbarProps {
  appName?: string;
  logoUrl?: string | null;
}

export function Navbar({ appName, logoUrl }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const displayName = appName || siteConfig.name;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center space-x-2">
          {logoUrl ? (
            <img src={logoUrl} alt={displayName} className="h-6 w-6 object-contain" />
          ) : (
            <Infinity className="h-6 w-6 text-primary" />
          )}
          <span className="text-xl font-bold">{displayName}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href={ROUTES.SIGNUP}>
            <Button size="sm">Get Started</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-4 space-y-3">
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-4 border-t">
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" className="w-full justify-start">
                  Log in
                </Button>
              </Link>
              <Link href={ROUTES.SIGNUP}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
