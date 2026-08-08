/**
 * Every rendered asset the storefront points at, in one place.
 *
 * Nothing here is uploaded by hand. The files are produced by the Remotion
 * studio one directory up — `npm run alkhayr` in the repo root — from the
 * catalogue in `src/alkhayr/media-plan.json`, and land in `public/media`.
 * Adding a banner means adding a plate there and a line here.
 *
 * Plates are *clean*: graded, cropped, and scrimmed for legibility, but with
 * no type baked in. Headlines are live HTML on top, so they stay editable,
 * stay sharp at any density, and stay readable to a crawler.
 */

import type { Theme } from "@/lib/theme";

const PLATE = "/media/plates";
const VIDEO = "/media/video";

export const plates = {
  /** 16:9 still behind the hero — the fallback before the clip is decoded. */
  heroWide: `${PLATE}/hero-wide.jpg`,
  /** 3:4 hero still for phones, where the wide crop loses the pour. */
  heroTall: `${PLATE}/hero-tall.jpg`,

  collectionChunmee: `${PLATE}/collection-chunmee.jpg`,
  collectionFine: `${PLATE}/collection-fine.jpg`,
  collectionChinese: `${PLATE}/collection-chinese.jpg`,

  ritual1: `${PLATE}/ritual-1.jpg`,
  ritual2: `${PLATE}/ritual-2.jpg`,
  ritual3: `${PLATE}/ritual-3.jpg`,

  story: `${PLATE}/story.jpg`,
  aboutPortrait: `${PLATE}/about-portrait.jpg`,
  promoStrip: `${PLATE}/promo-strip.jpg`,
  shopHeader: `${PLATE}/shop-header.jpg`,
  ctaBand: `${PLATE}/cta-band.jpg`,
  quality: `${PLATE}/quality.jpg`,
  delivery: `${PLATE}/delivery.jpg`,
} as const;

/**
 * Relit packshots, keyed by catalogue slug and rendered once per theme.
 *
 * The photographs behind these were all taken on the same sideboard in front
 * of tinsel — true to the shop, but four busy backgrounds in one grid shout
 * over the products. The rendered plate isolates each box and relights it at
 * the same size, so a row of them reads as one range.
 *
 * Two grades, because one doesn't stretch: the dark plate dissolves the room
 * into black, which on a light card reads as a black block with a milky band
 * where the card's own gradient meets it. The light plate dissolves the same
 * room into parchment instead.
 *
 * A product with no entry (anything added later from /admin) falls back to its
 * own uploaded photography, so this never blocks adding a product.
 */
export const packPlates: Record<Theme, Record<string, string>> = {
  dark: {
    "las-palmas": `${PLATE}/pack-las-palmas.jpg`,
    "sa9iya-l7amra": `${PLATE}/pack-sa9iya-l7amra.jpg`,
    smara: `${PLATE}/pack-smara.jpg`,
    "bit-lfakhama": `${PLATE}/pack-bit-lfakhama.jpg`,
  },
  light: {
    "las-palmas": `${PLATE}/pack-las-palmas-light.jpg`,
    "sa9iya-l7amra": `${PLATE}/pack-sa9iya-l7amra-light.jpg`,
    smara: `${PLATE}/pack-smara-light.jpg`,
    "bit-lfakhama": `${PLATE}/pack-bit-lfakhama-light.jpg`,
  },
};

export const packPlate = (slug: string, theme: Theme): string | null =>
  packPlates[theme][slug] ?? null;

export const clips = {
  hero: {
    mp4: `${VIDEO}/hero-loop.mp4`,
    webm: `${VIDEO}/hero-loop.webm`,
    poster: `${VIDEO}/hero-loop-poster.jpg`,
  },
  heroTall: {
    mp4: `${VIDEO}/hero-loop-tall.mp4`,
    poster: `${VIDEO}/hero-loop-tall-poster.jpg`,
  },
  short: {
    mp4: `${VIDEO}/short.mp4`,
    poster: `${VIDEO}/short-poster.jpg`,
  },
} as const;

export type ProductClip = {
  /** 9:16 — the ad landing page and stories/reels. */
  vertical: string;
  /** 1:1 — feed placements. */
  square: string;
  poster: string;
};

/**
 * Per-product ad clips. Keyed by catalogue slug; a product without an entry
 * simply falls back to its photography, so adding a product never breaks a
 * page before its clip has been rendered.
 */
export const productClips: Record<string, ProductClip> = {
  "las-palmas": {
    vertical: `${VIDEO}/ads/las-palmas-9x16.mp4`,
    square: `${VIDEO}/ads/las-palmas-1x1.mp4`,
    poster: `${VIDEO}/ads/las-palmas-poster.jpg`,
  },
  "sa9iya-l7amra": {
    vertical: `${VIDEO}/ads/sa9iya-l7amra-9x16.mp4`,
    square: `${VIDEO}/ads/sa9iya-l7amra-1x1.mp4`,
    poster: `${VIDEO}/ads/sa9iya-l7amra-poster.jpg`,
  },
  smara: {
    vertical: `${VIDEO}/ads/smara-9x16.mp4`,
    square: `${VIDEO}/ads/smara-1x1.mp4`,
    poster: `${VIDEO}/ads/smara-poster.jpg`,
  },
  "bit-lfakhama": {
    vertical: `${VIDEO}/ads/bit-lfakhama-9x16.mp4`,
    square: `${VIDEO}/ads/bit-lfakhama-1x1.mp4`,
    poster: `${VIDEO}/ads/bit-lfakhama-poster.jpg`,
  },
};

export const productClip = (slug: string): ProductClip | null =>
  productClips[slug] ?? null;

/* ------------------------------------------------------------ editorial */

export type Collection = {
  /** Matches `Category` in lib/products.ts. */
  category: string;
  title: string;
  blurb: string;
  plate: string;
};

/** The three grades, as a customer would actually choose between them. */
export const collections: Collection[] = [
  {
    category: "شنمي",
    title: "شنمي",
    blurb: "الأوراق الملفوفة اللي كتتحمّل الغليان — أساس الأتاي المغربي",
    plate: plates.collectionChunmee,
  },
  {
    category: "أخضر فاخر",
    title: "أخضر فاخر",
    blurb: "فرز أدقّ، مرارة أقل، وعطر يليق بضيافة المناسبات",
    plate: plates.collectionFine,
  },
  {
    category: "أخضر صيني",
    title: "أخضر صيني",
    blurb: "الخيار اليومي — قوّة ثابتة كتتحمّل السكر والنعناع",
    plate: plates.collectionChinese,
  },
];

export type RitualStep = {
  step: string;
  title: string;
  body: string;
  plate: string;
};

/** The four-step pour, which is most of what people search for. */
export const ritual: RitualStep[] = [
  {
    step: "01",
    title: "غسل الورقة",
    body: "صبّ الماء الساخن على الأوراق وارمِ أول ماء — كيمشي معه الغبار والمرارة الزائدة.",
    plate: plates.ritual1,
  },
  {
    step: "02",
    title: "النعناع والسكر",
    body: "زيد النعناع والسكر من بعد ما يغلي البراد، ماشي قبل، باش ما يمرّش طعم النعناع.",
    plate: plates.ritual2,
  },
  {
    step: "03",
    title: "الصبّ من علوّ",
    body: "صبّ من فوق حتى تطلع الرغوة، ورجّع الكأس للبراد مرتين حتى يتوازن الطعم.",
    plate: plates.ritual3,
  },
];
