"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { SHOW_CATALOG } from "@/lib/site-config";
import { useSiteSettings } from "@/components/site-settings-provider";
import { BrassRule, Khatem } from "@/components/khatem";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

const shopLinks = [
  ...(SHOW_CATALOG ? [{ href: "/shop", label: "المتجر" }] : []),
  { href: "/#collections", label: "الأنواع" },
  ...(SHOW_CATALOG ? [{ href: "/cart", label: "السلة" }] : []),
];

const aboutLinks = [
  { href: "/#ritual", label: "طريقة الأتاي" },
  { href: "/#story", label: "قصتنا" },
  { href: "/#contact", label: "تواصل" },
];

/** Local `06…` numbers need the country code before wa.me will accept them. */
function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const international = phone.trim().startsWith("0")
    ? `212${digits.slice(1)}`
    : digits;
  return `https://wa.me/${international}`;
}

export function Footer() {
  const { storeName, contactPhone, contactEmail, address } = useSiteSettings();

  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t brass-hairline bg-surface"
    >
      <div className="zellige-field pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="group flex items-center gap-2.5">
              <Khatem className="h-6 w-6 text-brass transition-transform duration-500 group-hover:rotate-45" />
              <span className="font-display text-2xl font-bold text-ink transition-colors group-hover:text-brass-light">
                {storeName}
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-ink-muted text-pretty">
              علب الشاي الأخضر اللي كيعرفها البراد المغربي — بأثمنة المحل، وبكرم
              الضيافة المغربية.
            </p>

            <a
              href={whatsappHref(contactPhone)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border brass-hairline bg-surface-raised px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-mint/50 hover:text-mint"
            >
              <WhatsAppIcon className="h-4 w-4" />
              راسلنا على واتساب
            </a>
          </div>

          <nav className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-brass">
              المتجر
            </h3>
            <ul className="space-y-2.5 text-sm text-ink-muted">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-brass">
              تعرّف علينا
            </h3>
            <ul className="space-y-2.5 text-sm text-ink-muted">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <BrassRule className="my-12" />

        <div className="grid gap-6 text-sm text-ink-muted sm:grid-cols-3">
          <p className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 shrink-0 text-brass" />
            <span dir="ltr">{contactPhone}</span>
          </p>
          {contactEmail && (
            <p className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-brass" />
              <span dir="ltr">{contactEmail}</span>
            </p>
          )}
          <p className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-brass" />
            {address}
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t brass-hairline pt-8 text-xs text-ink-faint sm:flex-row">
          <p>
            © {new Date().getFullYear()} {storeName}. جميع الحقوق محفوظة.
          </p>
          <p>صُنع بكرم فالمغرب 🇲🇦</p>
        </div>
      </div>
    </footer>
  );
}
