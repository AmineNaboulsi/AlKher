import {
  CITIES,
  DEFAULT_CITY,
  FREE_DELIVERY_THRESHOLD_MAD,
  PAYMENT_METHOD,
} from "@/lib/checkout-config";

export const runtime = "nodejs";

/**
 * Predefined checkout options. Static — the values live in code, not the
 * database — so it can be prerendered and served from the edge cache.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json({
    cities: CITIES,
    defaultCity: DEFAULT_CITY,
    freeDeliveryThresholdMAD: FREE_DELIVERY_THRESHOLD_MAD,
    paymentMethod: PAYMENT_METHOD,
  });
}
