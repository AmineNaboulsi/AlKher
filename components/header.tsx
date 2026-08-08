"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useSiteSettings } from "@/components/site-settings-provider";
import { Button } from "@/components/ui/button";
import { Khatem } from "@/components/khatem";
import { cn } from "@/lib/utils";
import { SHOW_CATALOG } from "@/lib/site-config";
import { useEffect, useState } from "react";

const navLinks = [
  ...(SHOW_CATALOG ? [{ href: "/shop", label: "المتجر" }] : []),
  { href: "/#ritual", label: "طريقة الأتاي" },
  { href: "/#story", label: "قصتنا" },
  { href: "/#contact", label: "تواصل" },
];

/**
 * The header sits over a full-bleed video hero, so it starts as nothing but a
 * soft top gradient and only becomes a surface once the page has scrolled past
 * it. A solid bar from frame one would cut the hero in half.
 */
export function Header() {
  const { itemCount, openCart } = useCart();
  const { storeName } = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A menu open behind a fixed header should not scroll the page under it.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      // `.header-float` is the unscrolled state, and it is theme-aware in CSS:
      // a bare gradient on the dark theme (the page beneath is already dark),
      // a frosted panel on the light one (where a transparent bar would put
      // dark type over a dark video). Either way the header's own `text-ink`
      // stays correct, so nothing here needs to know which theme is running.
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass border-b brass-hairline" : "header-float"
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label={storeName}
        >
          <Khatem className="h-6 w-6 text-brass transition-transform duration-500 group-hover:rotate-45" />
          <span className="font-display text-2xl font-bold tracking-tight text-ink transition-colors group-hover:text-brass-light">
            {storeName}
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative py-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-brass transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {SHOW_CATALOG && (
            <>
              <Button
                asChild
                variant="brass"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/shop">تسوق الآن</Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                aria-label={`السلة — ${itemCount} منتج`}
                className="relative"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -start-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brass text-[10px] font-bold text-night">
                    {itemCount}
                  </span>
                )}
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "إغلاق القائمة" : "القائمة"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t brass-hairline bg-background/98 px-4 pb-6 pt-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-border/50 py-3.5 font-display text-lg text-ink transition-colors hover:text-brass"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {SHOW_CATALOG && (
            <Button asChild variant="brass" size="lg" className="mt-4">
              <Link href="/shop" onClick={() => setMobileOpen(false)}>
                تسوق الآن
              </Link>
            </Button>
          )}
        </nav>
      )}
    </header>
  );
}
