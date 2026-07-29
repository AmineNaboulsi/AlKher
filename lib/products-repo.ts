import { getDb } from "@/lib/mongodb";
import type { Product } from "@/lib/products";

export const PRODUCTS_COLLECTION = "products";

export type ProductDocument = Product & {
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Storefront-visible products — everything except archived ones. */
export async function getActiveProducts(): Promise<ProductDocument[]> {
  const db = await getDb();
  return db
    .collection<ProductDocument>(PRODUCTS_COLLECTION)
    .find({ archived: false }, { projection: { _id: 0 } })
    .sort({ createdAt: 1 })
    .toArray();
}

/** Single product lookup for the storefront — null if missing or archived. */
export async function getActiveProductBySlug(
  slug: string
): Promise<ProductDocument | null> {
  const db = await getDb();
  return db
    .collection<ProductDocument>(PRODUCTS_COLLECTION)
    .findOne({ slug, archived: false }, { projection: { _id: 0 } });
}

export async function getFeaturedProducts(
  count = 4
): Promise<ProductDocument[]> {
  const products = await getActiveProducts();
  return products.filter((p) => p.inStock).slice(0, count);
}

export async function getRelatedProducts(
  product: ProductDocument,
  count = 3
): Promise<ProductDocument[]> {
  const products = await getActiveProducts();
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.slug !== product.slug
  );
  // With a small catalogue, top up from the rest so the section is never empty.
  const rest = products.filter(
    (p) => p.slug !== product.slug && !sameCategory.includes(p)
  );
  return [...sameCategory, ...rest].slice(0, count);
}
