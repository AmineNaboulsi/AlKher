import {
  CITIES,
  DEFAULT_CITY,
  DELIVERY_FEE_MAD,
  PAYMENT_METHOD,
} from "@/lib/checkout-config";
import { SHOW_CATALOG } from "@/lib/site-config";

export const runtime = "nodejs";

/**
 * Predefined checkout options. Static — the values live in code, not the
 * database — so it can be prerendered and served from the edge cache.
 */
export const dynamic = "force-static";

export function GET() {
  if (!SHOW_CATALOG) {
    return Response.json({ error: "المتجر مغلق حالياً." }, { status: 404 });
  }

  return Response.json({
    cities: CITIES,
    defaultCity: DEFAULT_CITY,
    deliveryFeeMAD: DELIVERY_FEE_MAD,
    paymentMethod: PAYMENT_METHOD,
  });
}
