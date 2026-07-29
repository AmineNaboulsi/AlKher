import { getDb } from "@/lib/mongodb";
import type { Promo } from "@/lib/promos";

export const PROMOS_COLLECTION = "promos";

export type PromoDocument = Promo & {
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Storefront-visible bundle offers — everything except archived ones. */
export async function getActivePromos(): Promise<PromoDocument[]> {
  const db = await getDb();
  return db
    .collection<PromoDocument>(PROMOS_COLLECTION)
    .find({ archived: false }, { projection: { _id: 0 } })
    .sort({ createdAt: 1 })
    .toArray();
}
