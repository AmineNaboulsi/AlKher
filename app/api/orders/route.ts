import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { isVariantInStock } from "@/lib/products";
import { getActiveProducts } from "@/lib/products-repo";
import { getActivePromos } from "@/lib/promos-repo";
import {
  deliveryFee,
  isKnownCity,
  normalisePhone,
  PAYMENT_METHOD,
} from "@/lib/checkout-config";
import { DatabaseNotConfiguredError, getDb } from "@/lib/mongodb";
import { priceCart } from "@/lib/promos";
import { SHOW_CATALOG } from "@/lib/site-config";
import {
  ORDERS_COLLECTION,
  type CreateOrderError,
  type OrderDocument,
  type OrderLine,
} from "@/lib/orders";
import { sendOrderWhatsAppMessage } from "@/lib/whatsapp";

export const runtime = "nodejs";

const MAX_ITEM_QUANTITY = 99;
const MAX_DISTINCT_ITEMS = 50;

/** Unambiguous alphabet — no 0/O/1/I — for numbers read aloud over the phone. */
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function createOrderNumber(): string {
  const bytes = randomBytes(6);
  let code = "";
  for (const byte of bytes) code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  return `KH-${code}`;
}

function badRequest(body: CreateOrderError, status = 400) {
  return Response.json(body, { status });
}

type RawItem = { slug?: unknown; weightGrams?: unknown; quantity?: unknown };

export async function POST(request: Request) {
  // Ordering is closed while the catalogue is hidden — otherwise the endpoint
  // would still accept orders for products no one can browse.
  if (!SHOW_CATALOG) {
    return badRequest({ error: "المتجر مغلق حالياً." }, 404);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest({ error: "صيغة الطلب غير صحيحة." });
  }

  if (typeof payload !== "object" || payload === null) {
    return badRequest({ error: "صيغة الطلب غير صحيحة." });
  }

  const body = payload as Record<string, unknown>;
  const fields: CreateOrderError["fields"] = {};

  // Catalogue and promos are fetched once, fresh, from the DB — the client
  // never sends prices, so every item and price below is checked against
  // this snapshot.
  let catalogBySlug: Map<string, Awaited<ReturnType<typeof getActiveProducts>>[number]>;
  let activePromos: Awaited<ReturnType<typeof getActivePromos>>;
  try {
    const [catalogProducts, promos] = await Promise.all([
      getActiveProducts(),
      getActivePromos(),
    ]);
    catalogBySlug = new Map(catalogProducts.map((p) => [p.slug, p]));
    activePromos = promos;
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error("[orders] MONGODB_URI is not set — order not saved");
      return badRequest(
        { error: "خدمة الطلبات غير مهيّأة حالياً. المرجو المحاولة لاحقاً." },
        503
      );
    }
    console.error("[orders] failed to load catalogue", error);
    return badRequest(
      { error: "تعذّر تسجيل الطلب. المرجو المحاولة مرة أخرى." },
      500
    );
  }
  const getProductBySlug = (slug: string) => catalogBySlug.get(slug);

  // --- Customer ---
  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  if (fullName.length < 3 || fullName.length > 80) {
    fields.fullName = "المرجو كتابة الاسم الكامل (3 أحرف على الأقل).";
  }

  const rawPhone = typeof body.phone === "string" ? body.phone : "";
  const phone = normalisePhone(rawPhone);
  if (!phone) {
    fields.phone = "رقم هاتف مغربي غير صحيح — مثال: 0612345678";
  }

  const cityName = typeof body.city === "string" ? body.city.trim() : "";
  if (!isKnownCity(cityName)) {
    fields.city = "المرجو اختيار مدينة من القائمة.";
  }

  // --- Items: prices are recomputed here, never taken from the client ---
  const rawItems = Array.isArray(body.items) ? (body.items as RawItem[]) : null;
  const items: OrderLine[] = [];

  if (!rawItems || rawItems.length === 0) {
    fields.items = "السلة فارغة.";
  } else if (rawItems.length > MAX_DISTINCT_ITEMS) {
    fields.items = "عدد المنتجات في السلة كبير جداً.";
  } else {
    for (const raw of rawItems) {
      const product =
        typeof raw.slug === "string" ? getProductBySlug(raw.slug) : undefined;
      const variant = product?.variants.find(
        (v) => v.weightGrams === raw.weightGrams
      );
      const quantity =
        typeof raw.quantity === "number" && Number.isInteger(raw.quantity)
          ? raw.quantity
          : 0;

      if (!product || !variant) {
        fields.items = "أحد المنتجات غير متوفر — المرجو تحديث السلة.";
        break;
      }
      if (!product.inStock) {
        fields.items = `${product.name} غير متوفر حالياً.`;
        break;
      }
      if (!isVariantInStock(variant)) {
        fields.items = `${product.name} — حجم ${variant.weightGrams} غرام نفد من المخزون.`;
        break;
      }
      if (quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
        fields.items = "الكمية المطلوبة غير صحيحة.";
        break;
      }

      items.push({
        slug: product.slug,
        name: product.name,
        weightGrams: variant.weightGrams,
        quantity,
        unitPriceMAD: variant.priceMAD,
        lineTotalMAD: variant.priceMAD * quantity,
      });
    }
  }

  if (Object.keys(fields).length > 0) {
    return badRequest({ error: "المرجو تصحيح المعلومات التالية.", fields });
  }

  // Bundle offers are matched here, server-side, from the validated lines.
  const pricing = priceCart(
    getProductBySlug,
    activePromos,
    items.map((i) => ({
      slug: i.slug,
      weightGrams: i.weightGrams,
      quantity: i.quantity,
    }))
  );
  const subtotalMAD = pricing.subtotalMAD;
  const deliveryFeeMAD = deliveryFee();

  const order: OrderDocument = {
    orderNumber: createOrderNumber(),
    status: "pending",
    paymentMethod: PAYMENT_METHOD.id,
    customer: { fullName, phone: phone!, city: cityName },
    items,
    appliedPromos: pricing.appliedPromos,
    fullPriceMAD: pricing.fullPriceMAD,
    discountMAD: pricing.discountMAD,
    subtotalMAD,
    deliveryFeeMAD,
    totalMAD: subtotalMAD + deliveryFeeMAD,
    createdAt: new Date(),
  };

  try {
    const db = await getDb();
    await db.collection<OrderDocument>(ORDERS_COLLECTION).insertOne(order);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error("[orders] MONGODB_URI is not set — order not saved");
      return badRequest(
        { error: "خدمة الطلبات غير مهيّأة حالياً. المرجو المحاولة لاحقاً." },
        503
      );
    }
    console.error("[orders] failed to save order", error);
    return badRequest(
      { error: "تعذّر تسجيل الطلب. المرجو المحاولة مرة أخرى." },
      500
    );
  }

  // WhatsApp notifications run after the response is sent — the order is
  // already saved, so a slow or erroring Meta call must never delay checkout
  // or affect the order-creation response. Every attempt is logged
  // regardless (see lib/whatsapp-log.ts).
  after(async () => {
    const whatsappResults = await sendOrderWhatsAppMessage(order);
    try {
      const db = await getDb();
      await db
        .collection<OrderDocument>(ORDERS_COLLECTION)
        .updateOne(
          { orderNumber: order.orderNumber },
          { $set: { whatsapp: whatsappResults } }
        );
    } catch (error) {
      console.error(
        `[orders] failed to store whatsapp delivery status for ${order.orderNumber}`,
        error
      );
    }
  });

  return Response.json(
    {
      orderNumber: order.orderNumber,
      appliedPromos: order.appliedPromos,
      fullPriceMAD: order.fullPriceMAD,
      discountMAD: order.discountMAD,
      subtotalMAD: order.subtotalMAD,
      deliveryFeeMAD: order.deliveryFeeMAD,
      totalMAD: order.totalMAD,
    },
    { status: 201 }
  );
}
