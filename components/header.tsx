"use client";

import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SHOW_CATALOG } from "@/lib/site-config";
import { useEffect, useState } from "react";

const navLinks = [
  ...(SHOW_CATALOG ? [{ href: "/shop", label: "المتجر" }] : []),
  { href: "/#story", label: "قصتنا" },
  { href: "/#contact", label: "تواصل" },
];

export function Header() {
  const { itemCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled
          ? "bg-surface/95 backdrop-blur-md border-b brass-hairline shadow-card"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-ink hover:text-brass transition-colors"
        >
          الخير
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {SHOW_CATALOG && (
            <Button
              variant="ghost"
              size="icon"
              onClick={openCart}
              aria-label={`السلة — ${itemCount} منتج`}
              className="relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -start-1 flex h-5 w-5 items-center justify-center rounded-full bg-brass text-[10px] font-bold text-background">
                  {itemCount}
                </span>
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="القائمة"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t brass-hairline bg-surface px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-muted hover:text-ink py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
