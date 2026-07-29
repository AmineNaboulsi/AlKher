import type { ProductDocument } from "@/lib/products-repo";

export type PromoFieldErrors = Partial<
  Record<"id" | "name" | "description" | "items" | "bundlePriceMAD", string>
>;

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_ITEMS = 10;
const MAX_ITEM_QUANTITY = 20;

export type ValidatedPromoItem = {
  slug: string;
  weightGrams: number;
  quantity: number;
};

export type ValidatedPromo = {
  id: string;
  name: string;
  description: string;
  items: ValidatedPromoItem[];
  bundlePriceMAD: number;
};

/**
 * Validates a create/update request body into a Promo, or returns
 * field-level Arabic error messages — mirrors lib/admin-products-validate.ts.
 * Cross-checks every item against the real (active) product catalogue so a
 * promo can never reference a slug/weight that doesn't actually exist.
 */
export function validatePromoInput(
  body: Record<string, unknown>,
  products: ProductDocument[]
): {
  fields: PromoFieldErrors;
  value: ValidatedPromo | null;
} {
  const fields: PromoFieldErrors = {};
  const productsBySlug = new Map(products.map((p) => [p.slug, p]));

  const id = typeof body.id === "string" ? body.id.trim().toLowerCase() : "";
  if (!ID_PATTERN.test(id)) {
    fields.id =
      "المعرّف يجب أن يحتوي على حروف لاتينية صغيرة وأرقام وشرطات فقط، مثال: duo-green-tea.";
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 150) {
    fields.name = "الاسم يجب أن يكون بين 2 و150 حرفاً.";
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (description.length < 2 || description.length > 500) {
    fields.description = "الوصف مطلوب.";
  }

  const bundlePriceMAD =
    typeof body.bundlePriceMAD === "number" ? body.bundlePriceMAD : NaN;
  if (
    !Number.isFinite(bundlePriceMAD) ||
    bundlePriceMAD <= 0 ||
    bundlePriceMAD > 100000
  ) {
    fields.bundlePriceMAD = "سعر العرض غير صحيح.";
  }

  const itemsRaw = Array.isArray(body.items) ? body.items : [];
  const items: ValidatedPromoItem[] = [];
  if (itemsRaw.length === 0) {
    fields.items = "أضف منتجاً واحداً على الأقل.";
  } else if (itemsRaw.length > MAX_ITEMS) {
    fields.items = "عدد المنتجات في العرض كبير جداً.";
  } else {
    for (const raw of itemsRaw as Record<string, unknown>[]) {
      const slug = typeof raw.slug === "string" ? raw.slug : "";
      const weightGrams =
        typeof raw.weightGrams === "number" ? raw.weightGrams : NaN;
      const quantity =
        typeof raw.quantity === "number" && Number.isInteger(raw.quantity)
          ? raw.quantity
          : NaN;

      const product = productsBySlug.get(slug);
      if (!product) {
        fields.items = "أحد المنتجات في العرض غير موجود — حدّث القائمة.";
        break;
      }
      const variant = product.variants.find((v) => v.weightGrams === weightGrams);
      if (!variant) {
        fields.items = `${product.name} — الوزن المحدّد غير متوفر لهذا المنتج.`;
        break;
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
        fields.items = "الكمية غير صحيحة.";
        break;
      }

      items.push({ slug, weightGrams, quantity });
    }
  }

  if (Object.keys(fields).length > 0) {
    return { fields, value: null };
  }

  return {
    fields: {},
    value: { id, name, description, items, bundlePriceMAD },
  };
}
