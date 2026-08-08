import type { Theme } from "@/lib/theme";

/**
 * Static site flags.
 *
 * These are plain compile-time constants, not environment variables — flip the
 * value here and rebuild. Keeping them static means unused branches are dropped
 * from the bundle and the catalogue routes are absent from the build output
 * entirely when disabled.
 */

/**
 * Theme for the storefront: home, shop, product pages, cart, checkout.
 *
 * "dark" is the night-souk treatment the photography was graded for; "light"
 * is the warm-parchment daytime version of the same design — same layout, same
 * components, same brass, different ground.
 */
export const STORE_THEME: Theme = "dark";

/**
 * Theme for the `/lp/*` ad landing pages, set separately on purpose: paid
 * traffic behaves differently from someone browsing the shop, and which ground
 * converts better is worth testing rather than assuming.
 */
export const LANDING_THEME: Theme = "dark";

/**
 * Show the on-page theme switcher and honour `?theme=` on the URL.
 *
 * Leave this on while deciding; turn it off for a public launch so a visitor
 * can't land on the version you didn't design the campaign around.
 */
export const ALLOW_THEME_PREVIEW = true;

/**
 * Show the product catalogue: the shop listing, individual product pages, the
 * homepage product sections, and the cart/checkout entry points.
 *
 * While this is `false` the site reads as a pre-launch page — hero, story and
 * contact only — and `/shop` plus `/product/*` return 404.
 */
export const SHOW_CATALOG = true;

/**
 * Show category surfaces: the "تصفّح حسب النوع" strip on the homepage, the
 * category filter in the shop sidebar, and the category badge on product cards
 * and product pages.
 *
 * Independent of {@link SHOW_CATALOG} — with the catalogue on and this off,
 * products list and sell exactly as normal, they just aren't grouped or
 * labelled by type. Products keep their `category` field either way.
 */
export const SHOW_CATEGORIES = false;
