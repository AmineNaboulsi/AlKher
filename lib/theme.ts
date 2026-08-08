/**
 * Light/dark as a parameter.
 *
 * The storefront and the ad landing pages each pick their own theme — an ad
 * page bought with paid traffic and the shop a customer browses are different
 * jobs, and they don't have to look the same. Defaults live in
 * `lib/site-config.ts`; this module is the vocabulary they share.
 *
 * Resolution order, highest first:
 *
 *   1. `?theme=light` / `?theme=dark` on the URL — for previewing.
 *   2. The `alkhayr-theme` cookie, which the preview param sets so the choice
 *      survives navigation.
 *   3. The compile-time default for the surface you're on.
 *
 * The proxy resolves all three and hands the answer to the layout in a request
 * header, because only the proxy knows the pathname before the root layout
 * renders — and the root layout is what puts `data-theme` on `<html>`.
 */

export const THEMES = ["dark", "light"] as const;

export type Theme = (typeof THEMES)[number];

/** Query parameter that previews a theme and persists it to the cookie. */
export const THEME_PARAM = "theme";

/** Cookie the preview writes to. `?theme=auto` clears it. */
export const THEME_COOKIE = "alkhayr-theme";

/** Request header the proxy uses to tell the layout what it resolved. */
export const THEME_HEADER = "x-alkhayr-theme";

/** Header carrying which surface the request landed on, for the switcher UI. */
export const SURFACE_HEADER = "x-alkhayr-surface";

export type Surface = "store" | "landing";

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && THEMES.includes(value as Theme);
}

/** Ad landing pages are their own surface; everything else is the store. */
export function surfaceOf(pathname: string): Surface {
  return pathname === "/lp" || pathname.startsWith("/lp/")
    ? "landing"
    : "store";
}

export const THEME_LABELS: Record<Theme, string> = {
  dark: "داكن",
  light: "فاتح",
};
