import { getDb } from "@/lib/mongodb";
import {
  ORDERS_COLLECTION,
  type OrderDocument,
  type OrderStatus,
} from "@/lib/orders";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "cancelled",
];

export type OrderFilters = {
  status?: string | null;
  city?: string | null;
  from?: string | null;
  to?: string | null;
  search?: string | null;
};

export type OrderFilterErrors = Partial<Record<"status" | "from" | "to", string>>;

const MAX_RESULTS = 200;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Turns raw (query-string) filter values into a validated MongoDB filter.
 * Shared by the admin API route and the admin dashboard page so both agree
 * on what counts as a valid filter and how errors are reported.
 */
export function buildOrderFilter(filters: OrderFilters): {
  filter: Record<string, unknown>;
  errors: OrderFilterErrors;
} {
  const filter: Record<string, unknown> = {};
  const errors: OrderFilterErrors = {};

  const status = filters.status?.trim();
  if (status) {
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      errors.status = `الحالة غير صحيحة. القيم المسموحة: ${ORDER_STATUSES.join(", ")}`;
    } else {
      filter.status = status;
    }
  }

  const city = filters.city?.trim();
  if (city) filter["customer.city"] = city;

  const search = filters.search?.trim();
  if (search) {
    const pattern = escapeRegex(search);
    filter.$or = [
      { orderNumber: { $regex: pattern, $options: "i" } },
      { "customer.phone": { $regex: pattern, $options: "i" } },
      { "customer.fullName": { $regex: pattern, $options: "i" } },
    ];
  }

  const createdAt: Record<string, Date> = {};

  const from = filters.from?.trim();
  if (from) {
    const date = new Date(from);
    if (Number.isNaN(date.getTime())) {
      errors.from = "تاريخ البداية غير صحيحة.";
    } else {
      createdAt.$gte = date;
    }
  }

  const to = filters.to?.trim();
  if (to) {
    const date = new Date(to);
    if (Number.isNaN(date.getTime())) {
      errors.to = "تاريخ النهاية غير صحيحة.";
    } else {
      date.setHours(23, 59, 59, 999);
      createdAt.$lte = date;
    }
  }

  if (Object.keys(createdAt).length > 0) filter.createdAt = createdAt;

  return { filter, errors };
}

export async function queryOrders(
  filters: OrderFilters
): Promise<{ orders: OrderDocument[]; errors: OrderFilterErrors }> {
  const { filter, errors } = buildOrderFilter(filters);
  if (Object.keys(errors).length > 0) return { orders: [], errors };

  const db = await getDb();
  const orders = await db
    .collection<OrderDocument>(ORDERS_COLLECTION)
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(MAX_RESULTS)
    .toArray();

  return { orders, errors };
}
