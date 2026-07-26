/**
 * Server-side source of truth for checkout options. The client never sends
 * prices or fees — it only sends a city name, which is validated against this
 * list, and the API recomputes every amount from here plus the catalogue.
 */

/** Flat delivery charge — same for every city, every order size. */
export const DELIVERY_FEE_MAD = 10;

export const CITIES: string[] = [
  "الدار البيضاء",
  "الرباط",
  "سلا",
  "القنيطرة",
  "مراكش",
  "فاس",
  "مكناس",
  "طنجة",
  "تطوان",
  "أكادير",
  "آسفي",
  "الجديدة",
  "بني ملال",
  "خريبكة",
  "الصويرة",
  "تازة",
  "وجدة",
  "الناظور",
  "ورزازات",
  "الرشيدية",
  "العيون",
  "السمارة",
  "بوجدور",
  "الداخلة",
];

export const DEFAULT_CITY = "الدار البيضاء";

export const PAYMENT_METHOD = {
  id: "cod",
  label: "الدفع عند الاستلام",
  note: "تدفع نقداً لموصّل الطلب عند التسليم — لا حاجة لبطاقة بنكية.",
} as const;

export function isKnownCity(name: string): boolean {
  return CITIES.includes(name);
}

export function deliveryFee(): number {
  return DELIVERY_FEE_MAD;
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
