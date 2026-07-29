export const CATEGORIES = ["شنمي", "أخضر فاخر", "أخضر صيني"] as const;

export type Category = (typeof CATEGORIES)[number];

export type WeightGrams = 50 | 100 | 200 | 250 | 500 | 1000;

export type Variant = {
  weightGrams: WeightGrams;
  priceMAD: number;
  /** Defaults to true. Set false to list the size but block ordering it. */
  inStock?: boolean;
};

/** A variant is orderable unless it says otherwise. */
export function isVariantInStock(variant: Variant): boolean {
  return variant.inStock !== false;
}

export type Product = {
  slug: string;
  name: string;
  category: Category;
  origin: string;
  shortDescription: string;
  description: string;
  flavorNotes: string[];
  brewing: {
    tempC: number;
    steepMinutes: number;
    notes: string;
  };
  variants: Variant[];
  images: string[];
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
};
