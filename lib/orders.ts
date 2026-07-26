/**
 * Shared order shapes. Types only — no server-side imports — so the checkout
 * form can reference them without pulling Node modules into the client bundle.
 */

export type OrderLine = {
  slug: string;
  name: string;
  weightGrams: number;
  quantity: number;
  unitPriceMAD: number;
  lineTotalMAD: number;
};

export type OrderCustomer = {
  fullName: string;
  phone: string;
  city: string;
};

export type OrderStatus = "pending" | "confirmed" | "shipped" | "cancelled";

export type OrderDocument = {
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: "cod";
  customer: OrderCustomer;
  items: OrderLine[];
  subtotalMAD: number;
  deliveryFeeMAD: number;
  totalMAD: number;
  createdAt: Date;
};

/** What the checkout form posts to `/api/orders`. */
export type CreateOrderRequest = {
  fullName: string;
  phone: string;
  city: string;
  items: { slug: string; weightGrams: number; quantity: number }[];
};

export type CreateOrderSuccess = {
  orderNumber: string;
  subtotalMAD: number;
  deliveryFeeMAD: number;
  totalMAD: number;
};

export type CreateOrderError = {
  error: string;
  /** Field-level messages keyed by form field name. */
  fields?: Partial<Record<"fullName" | "phone" | "city" | "items", string>>;
};

export const ORDERS_COLLECTION = "orders";
