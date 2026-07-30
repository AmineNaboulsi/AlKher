"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "الطلبات" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/promos", label: "العروض" },
  { href: "/admin/landing-pages", label: "صفحات الإعلانات" },
  { href: "/admin/whatsapp", label: "واتساب" },
  { href: "/admin/settings", label: "الإعدادات" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-majorelle/10 text-majorelle"
                : "text-ink-muted hover:text-ink hover:bg-surface-raised"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
