import { getDb } from "@/lib/mongodb";
import { PROMOS_COLLECTION, type PromoDocument } from "@/lib/promos-repo";

export type PromoFilters = {
  search?: string | null;
  /** "active" | "archived" | "" (all) */
  status?: string | null;
};

export type PromoFilterErrors = Partial<Record<"status", string>>;

const MAX_RESULTS = 200;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Turns raw (query-string) filter values into a validated MongoDB filter.
 * Mirrors lib/admin-products-repo.ts so every admin list view agrees on how
 * filters are validated and errors reported. Unlike the public
 * lib/promos-repo.ts, this includes archived promos by default.
 */
export function buildPromoFilter(filters: PromoFilters): {
  filter: Record<string, unknown>;
  errors: PromoFilterErrors;
} {
  const filter: Record<string, unknown> = {};
  const errors: PromoFilterErrors = {};

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
      { id: { $regex: pattern, $options: "i" } },
    ];
  }

  return { filter, errors };
}

export async function queryPromos(
  filters: PromoFilters
): Promise<{ promos: PromoDocument[]; errors: PromoFilterErrors }> {
  const { filter, errors } = buildPromoFilter(filters);
  if (Object.keys(errors).length > 0) return { promos: [], errors };

  const db = await getDb();
  const promos = await db
    .collection<PromoDocument>(PROMOS_COLLECTION)
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(MAX_RESULTS)
    .toArray();

  return { promos, errors };
}

/** Admin single-promo lookup — unlike the storefront repo, returns archived promos too. */
export async function getPromoByIdForAdmin(
  id: string
): Promise<PromoDocument | null> {
  const db = await getDb();
  return db
    .collection<PromoDocument>(PROMOS_COLLECTION)
    .findOne({ id }, { projection: { _id: 0 } });
}

export async function isPromoIdTaken(
  id: string,
  excludeId?: string
): Promise<boolean> {
  const db = await getDb();
  const existing = await db
    .collection<PromoDocument>(PROMOS_COLLECTION)
    .findOne({ id }, { projection: { _id: 0, id: 1 } });
  return existing !== null && existing.id !== excludeId;
}

export type PromoInput = {
  id: string;
  name: string;
  description: string;
  items: { slug: string; weightGrams: number; quantity: number }[];
  bundlePriceMAD: number;
};

export async function createPromo(input: PromoInput): Promise<PromoDocument> {
  const db = await getDb();
  const now = new Date();
  const doc: PromoDocument = {
    ...input,
    items: input.items as PromoDocument["items"],
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
  // insertOne mutates `doc` to add a Mongo _id — return a clean copy instead
  // of leaking that internal field to the client.
  await db.collection<PromoDocument>(PROMOS_COLLECTION).insertOne(doc);
  return {
    ...input,
    items: input.items as PromoDocument["items"],
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updatePromo(
  id: string,
  input: Partial<PromoInput> & { archived?: boolean }
): Promise<PromoDocument | null> {
  const db = await getDb();
  const { items, ...rest } = input;
  return db
    .collection<PromoDocument>(PROMOS_COLLECTION)
    .findOneAndUpdate(
      { id },
      {
        $set: {
          ...rest,
          ...(items ? { items: items as PromoDocument["items"] } : {}),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after", projection: { _id: 0 } }
    );
}

export async function setArchived(
  id: string,
  archived: boolean
): Promise<PromoDocument | null> {
  return updatePromo(id, { archived });
}
