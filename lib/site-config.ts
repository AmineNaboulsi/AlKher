/**
 * Static site flags.
 *
 * These are plain compile-time constants, not environment variables — flip the
 * value here and rebuild. Keeping them static means unused branches are dropped
 * from the bundle and the catalogue routes are absent from the build output
 * entirely when disabled.
 */

/**
 * Show the product catalogue: the shop listing, individual product pages, the
 * homepage product sections, and the cart/checkout entry points.
 *
 * While this is `false` the site reads as a pre-launch page — hero, story and
 * contact only — and `/shop` plus `/product/*` return 404.
 */
export const SHOW_CATALOG = true;
