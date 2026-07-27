import { getDb } from "@/lib/mongodb";
import { ORDERS_COLLECTION, type OrderDocument } from "@/lib/orders";

export async function getOrderByNumber(
  orderNumber: string
): Promise<OrderDocument | null> {
  const db = await getDb();
  return db
    .collection<OrderDocument>(ORDERS_COLLECTION)
    .findOne({ orderNumber }, { projection: { _id: 0 } });
}
