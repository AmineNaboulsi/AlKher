import { getDb } from "@/lib/mongodb";
import { PRODUCTS_COLLECTION, type ProductDocument } from "@/lib/products-repo";
import { CATEGORIES, type Category, type Product } from "@/lib/products";

export type ProductFilters = {
  search?: string | null;
  category?: string | null;
  /** "active" | "archived" | "" (all) */
  status?: string | null;
};

export type ProductFilterErrors = Partial<Record<"category" | "status", string>>;

const MAX_RESULTS = 200;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Turns raw (query-string) filter values into a validated MongoDB filter.
 * Mirrors lib/admin-orders-repo.ts so every admin list view agrees on how
 * filters are validated and errors reported. Unlike the public
 * lib/products-repo.ts, this includes archived products by default.
 */
export function buildProductFilter(filters: ProductFilters): {
  filter: Record<string, unknown>;
  errors: ProductFilterErrors;
} {
  const filter: Record<string, unknown> = {};
  const errors: ProductFilterErrors = {};

  const category = filters.category?.trim();
  if (category) {
    if (!CATEGORIES.includes(category as Category)) {
      errors.category = `الفئة غير صحيحة. القيم المسموحة: ${CATEGORIES.join(", ")}`;
    } else {
      filter.category = category;
    }
  }

  const status = filters.status?.trim();
  if (status) {
    if (status === "active") filter.archived = false;
    else if (status === "archived") filter.archived = true;
    else errors.status = "الحالة غير صحيحة. القيم المسموحة: active, archived";
  }

  const search = filters.search?.trim();
  if (search) {
    const pattern = escapeRegex(search);
    filter.$or = [
      { name: { $regex: pattern, $options: "i" } },
      { slug: { $regex: pattern, $options: "i" } },
    ];
  }

  return { filter, errors };
}

export async function queryProducts(
  filters: ProductFilters
): Promise<{ products: ProductDocument[]; errors: ProductFilterErrors }> {
  const { filter, errors } = buildProductFilter(filters);
  if (Object.keys(errors).length > 0) return { products: [], errors };

  const db = await getDb();
  const products = await db
    .collection<ProductDocument>(PRODUCTS_COLLECTION)
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(MAX_RESULTS)
    .toArray();

  return { products, errors };
}

/** Admin single-product lookup — unlike the storefront repo, returns archived products too. */
export async function getProductBySlugForAdmin(
  slug: string
): Promise<ProductDocument | null> {
  const db = await getDb();
  return db
    .collection<ProductDocument>(PRODUCTS_COLLECTION)
    .findOne({ slug }, { projection: { _id: 0 } });
}

/** Normalises admin input into a URL-safe slug — Arabic product names aren't derivable into one automatically, so this only cleans up whatever the admin typed. */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function isSlugTaken(
  slug: string,
  excludeSlug?: string
): Promise<boolean> {
  const db = await getDb();
  const existing = await db
    .collection<ProductDocument>(PRODUCTS_COLLECTION)
    .findOne({ slug }, { projection: { _id: 0, slug: 1 } });
  return existing !== null && existing.slug !== excludeSlug;
}

export type ProductInput = Product;

export async function createProduct(
  input: ProductInput
): Promise<ProductDocument> {
  const db = await getDb();
  const now = new Date();
  const doc: ProductDocument = {
    ...input,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
  // insertOne mutates `doc` to add a Mongo _id — return a clean copy instead
  // of leaking that internal field to the client.
  await db.collection<ProductDocument>(PRODUCTS_COLLECTION).insertOne(doc);
  return { ...input, archived: false, createdAt: now, updatedAt: now };
}

export async function updateProduct(
  slug: string,
  input: Partial<ProductInput> & { archived?: boolean }
): Promise<ProductDocument | null> {
  const db = await getDb();
  return db
    .collection<ProductDocument>(PRODUCTS_COLLECTION)
    .findOneAndUpdate(
      { slug },
      { $set: { ...input, updatedAt: new Date() } },
      { returnDocument: "after", projection: { _id: 0 } }
    );
}

export async function setArchived(
  slug: string,
  archived: boolean
): Promise<ProductDocument | null> {
  return updateProduct(slug, { archived });
}
