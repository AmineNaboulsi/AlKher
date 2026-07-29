import type { WeightGrams } from "./products";

/**
 * Bundle offers. A promo is a set of required items sold together for a fixed
 * price. Pricing is applied by matching cart contents against these rules, so a
 * customer gets the offer whether they tap "add offer" or happen to assemble
 * the same basket by hand.
 *
 * Pure data + pure functions — safe to import from both the client and the
 * orders API, which is what keeps the displayed total and the charged total in
 * agreement. The catalogue itself now lives in MongoDB rather than a static
 * import, so every pricing function here takes an explicit catalog lookup
 * instead of reaching for a module-level products array — callers supply one
 * backed by whatever they already fetched (the client's ProductCatalogProvider,
 * or a fresh DB read in the orders API).
 */

export type Promo = {
  id: string;
  name: string;
  description: string;
  items: { slug: string; weightGrams: WeightGrams; quantity: number }[];
  bundlePriceMAD: number;
};

export const PROMOS: Promo[] = [
  {
    id: "duo-las-palmas",
    name: "علبتان لاس بالماس",
    description: "عبوتان من لاس بالماس 41022 توب — 500 غرام لكل واحدة.",
    items: [{ slug: "las-palmas", weightGrams: 500, quantity: 2 }],
    bundlePriceMAD: 90,
  },
  {
    id: "trio-200g",
    name: "الثلاثية — سمارة وبيت الفخامة والساقية الحمراء",
    description:
      "علبة من كل نوع، 200 غرام لكل واحدة: سمارة، بيت الفخامة، والساقية الحمراء.",
    items: [
      { slug: "smara", weightGrams: 200, quantity: 1 },
      { slug: "bit-lfakhama", weightGrams: 200, quantity: 1 },
      { slug: "sa9iya-l7amra", weightGrams: 200, quantity: 1 },
    ],
    bundlePriceMAD: 50,
  },
];

export function getPromoById(id: string): Promo | undefined {
  return PROMOS.find((p) => p.id === id);
}

/** Minimal shape pricing needs from a product — satisfied by ProductDocument. */
export type PriceableProduct = {
  variants: { weightGrams: number; priceMAD: number }[];
};

export type CatalogLookup = (slug: string) => PriceableProduct | undefined;

export function unitPrice(
  catalog: CatalogLookup,
  slug: string,
  weightGrams: number
): number {
  const product = catalog(slug);
  return (
    product?.variants.find((v) => v.weightGrams === weightGrams)?.priceMAD ?? 0
  );
}

/** What the promo's contents cost when bought separately. */
export function promoFullPrice(catalog: CatalogLookup, promo: Promo): number {
  return promo.items.reduce(
    (sum, i) => sum + unitPrice(catalog, i.slug, i.weightGrams) * i.quantity,
    0
  );
}

export function promoSaving(catalog: CatalogLookup, promo: Promo): number {
  return promoFullPrice(catalog, promo) - promo.bundlePriceMAD;
}

export type CartLineInput = {
  slug: string;
  weightGrams: number;
  quantity: number;
};

export type AppliedPromo = {
  promoId: string;
  name: string;
  /** How many times the offer fits in the cart. */
  times: number;
  bundlePriceMAD: number;
  totalMAD: number;
};

export type PricedCart = {
  appliedPromos: AppliedPromo[];
  /** Items left over once the offers took what they could, at unit price. */
  remainderMAD: number;
  /** What the same basket would cost with no offers applied. */
  fullPriceMAD: number;
  subtotalMAD: number;
  discountMAD: number;
};

const key = (slug: string, weightGrams: number) => `${slug}|${weightGrams}`;

/**
 * Greedily applies offers, best saving first, then charges whatever is left at
 * unit price.
 */
export function priceCart(
  catalog: CatalogLookup,
  lines: CartLineInput[]
): PricedCart {
  const remaining = new Map<string, number>();
  for (const line of lines) {
    const k = key(line.slug, line.weightGrams);
    remaining.set(k, (remaining.get(k) ?? 0) + line.quantity);
  }

  const fullPriceMAD = lines.reduce(
    (sum, l) => sum + unitPrice(catalog, l.slug, l.weightGrams) * l.quantity,
    0
  );

  const appliedPromos: AppliedPromo[] = [];
  const ordered = [...PROMOS].sort(
    (a, b) => promoSaving(catalog, b) - promoSaving(catalog, a)
  );

  for (const promo of ordered) {
    if (promo.items.length === 0) continue;

    let times = Infinity;
    for (const item of promo.items) {
      const have = remaining.get(key(item.slug, item.weightGrams)) ?? 0;
      times = Math.min(times, Math.floor(have / item.quantity));
    }
    if (!Number.isFinite(times) || times < 1) continue;

    for (const item of promo.items) {
      const k = key(item.slug, item.weightGrams);
      remaining.set(k, (remaining.get(k) ?? 0) - item.quantity * times);
    }

    appliedPromos.push({
      promoId: promo.id,
      name: promo.name,
      times,
      bundlePriceMAD: promo.bundlePriceMAD,
      totalMAD: promo.bundlePriceMAD * times,
    });
  }

  let remainderMAD = 0;
  for (const [k, qty] of remaining) {
    if (qty <= 0) continue;
    const [slug, weight] = k.split("|");
    remainderMAD += unitPrice(catalog, slug, Number(weight)) * qty;
  }

  const subtotalMAD =
    appliedPromos.reduce((sum, a) => sum + a.totalMAD, 0) + remainderMAD;

  return {
    appliedPromos,
    remainderMAD,
    fullPriceMAD,
    subtotalMAD,
    discountMAD: fullPriceMAD - subtotalMAD,
  };
}
