/**
 * Server-side source of truth for checkout options. The client never sends
 * prices or fees — it only sends a city name, which is validated against this
 * list, and the API recomputes every amount from here plus the catalogue.
 *
 * NOTE: the delivery fees below are placeholders. Replace them with the real
 * per-city rates before taking live orders.
 */

export type DeliveryCity = {
  name: string;
  deliveryFeeMAD: number;
};

export const CITIES: DeliveryCity[] = [
  { name: "الدار البيضاء", deliveryFeeMAD: 10 },
  { name: "الرباط", deliveryFeeMAD: 25 },
  { name: "سلا", deliveryFeeMAD: 25 },
  { name: "القنيطرة", deliveryFeeMAD: 25 },
  { name: "مراكش", deliveryFeeMAD: 25 },
  { name: "فاس", deliveryFeeMAD: 25 },
  { name: "مكناس", deliveryFeeMAD: 25 },
  { name: "طنجة", deliveryFeeMAD: 30 },
  { name: "تطوان", deliveryFeeMAD: 30 },
  { name: "أكادير", deliveryFeeMAD: 30 },
  { name: "آسفي", deliveryFeeMAD: 30 },
  { name: "الجديدة", deliveryFeeMAD: 30 },
  { name: "بني ملال", deliveryFeeMAD: 30 },
  { name: "خريبكة", deliveryFeeMAD: 30 },
  { name: "الصويرة", deliveryFeeMAD: 35 },
  { name: "تازة", deliveryFeeMAD: 35 },
  { name: "وجدة", deliveryFeeMAD: 35 },
  { name: "الناظور", deliveryFeeMAD: 35 },
  { name: "ورزازات", deliveryFeeMAD: 40 },
  { name: "الرشيدية", deliveryFeeMAD: 40 },
  { name: "العيون", deliveryFeeMAD: 45 },
  { name: "السمارة", deliveryFeeMAD: 50 },
  { name: "بوجدور", deliveryFeeMAD: 50 },
  { name: "الداخلة", deliveryFeeMAD: 55 },
];

export const DEFAULT_CITY = "الدار البيضاء";

/** Orders at or above this subtotal ship free. */
export const FREE_DELIVERY_THRESHOLD_MAD = 300;

export const PAYMENT_METHOD = {
  id: "cod",
  label: "الدفع عند الاستلام",
  note: "تدفع نقداً لموصّل الطلب عند التسليم — لا حاجة لبطاقة بنكية.",
} as const;

export function findCity(name: string): DeliveryCity | undefined {
  return CITIES.find((c) => c.name === name);
}

export function deliveryFeeFor(city: DeliveryCity, subtotalMAD: number): number {
  return subtotalMAD >= FREE_DELIVERY_THRESHOLD_MAD ? 0 : city.deliveryFeeMAD;
}

/**
 * Normalises a Moroccan phone number to local `0XXXXXXXXX` form.
 * Returns null when the input is not a plausible Moroccan number.
 */
export function normalisePhone(input: string): string | null {
  // Keep digits and a leading +, drop spaces, dashes, dots, parentheses.
  const cleaned = input.replace(/[\s.\-()]/g, "");

  let local: string;
  if (/^\+212\d{9}$/.test(cleaned)) {
    local = `0${cleaned.slice(4)}`;
  } else if (/^00212\d{9}$/.test(cleaned)) {
    local = `0${cleaned.slice(5)}`;
  } else if (/^212\d{9}$/.test(cleaned)) {
    local = `0${cleaned.slice(3)}`;
  } else if (/^0\d{9}$/.test(cleaned)) {
    local = cleaned;
  } else {
    return null;
  }

  // Moroccan mobile prefixes are 06/07, landlines 05.
  if (!/^0[567]/.test(local)) return null;

  return local;
}
