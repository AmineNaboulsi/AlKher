"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Moon, Sun, RotateCcw } from "lucide-react";
import { THEME_LABELS, THEMES, type Surface, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const SURFACE_LABELS: Record<Surface, string> = {
  store: "المتجر",
  landing: "صفحة الإعلان",
};

const ICONS: Record<Theme, typeof Moon> = {
  dark: Moon,
  light: Sun,
};

/**
 * Preview control for the light/dark parameter.
 *
 * Plain links rather than a client-side toggle: `?theme=` is read by the proxy,
 * which writes the cookie and bounces to a clean URL, so the switch works with
 * JavaScript off, survives navigation, and leaves nothing in the address bar to
 * be shared by accident.
 *
 * Rendered only while `ALLOW_THEME_PREVIEW` is on — this is a tool for choosing
 * between the two versions, not a customer-facing setting.
 */
export function ThemeSwitcher({
  theme,
  surface,
  configured,
}: {
  /** What is actually rendering right now. */
  theme: Theme;
  surface: Surface;
  /** The compile-time default for this surface, from `lib/site-config.ts`. */
  configured: Theme;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hrefFor = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("theme", value);
    return `${pathname}?${params.toString()}`;
  };

  const overridden = theme !== configured;

  return (
    <aside
      dir="rtl"
      aria-label="معاينة الثيم"
      className="fixed bottom-4 start-4 z-[60] flex items-center gap-1 rounded-full border brass-hairline-strong glass p-1 text-xs shadow-card"
    >
      <span className="ps-3 pe-1 text-ink-faint">
        {SURFACE_LABELS[surface]}
      </span>

      {THEMES.map((value) => {
        const Icon = ICONS[value];
        const active = theme === value;
        return (
          <a
            key={value}
            href={hrefFor(value)}
            aria-current={active}
            title={`${THEME_LABELS[value]}${
              value === configured ? " — الافتراضي" : ""
            }`}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors",
              active
                ? "bg-brass text-night"
                : "text-ink-muted hover:bg-surface-raised hover:text-ink"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {THEME_LABELS[value]}
          </a>
        );
      })}

      {overridden && (
        <a
          href={hrefFor("auto")}
          title="رجّع للافتراضي"
          aria-label="رجّع للافتراضي"
          className="flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-raised hover:text-ink"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </a>
      )}
    </aside>
  );
}
