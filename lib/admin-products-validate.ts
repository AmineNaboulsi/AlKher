import { CATEGORIES, type Category, type Product, type Variant, type WeightGrams } from "@/lib/products";

export type ProductFieldErrors = Partial<
  Record<
    | "name"
    | "slug"
    | "category"
    | "origin"
    | "shortDescription"
    | "description"
    | "flavorNotes"
    | "brewing"
    | "variants"
    | "images",
    string
  >
>;

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_VARIANTS = 10;
const MAX_IMAGES = 10;
const MAX_FLAVOR_NOTES = 10;

/**
 * Validates a create/update request body into a Product, or returns
 * field-level Arabic error messages — mirrors the inline validation style
 * already used by app/api/orders/route.ts.
 */
export function validateProductInput(body: Record<string, unknown>): {
  fields: ProductFieldErrors;
  value: Product | null;
} {
  const fields: ProductFieldErrors = {};

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 120) {
    fields.name = "الاسم يجب أن يكون بين 2 و120 حرفاً.";
  }

  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (!SLUG_PATTERN.test(slug)) {
    fields.slug =
      "المعرّف (slug) يجب أن يحتوي على حروف لاتينية صغيرة وأرقام وشرطات فقط، مثال: green-tea-500g.";
  }

  const category = typeof body.category === "string" ? body.category : "";
  if (!CATEGORIES.includes(category as Category)) {
    fields.category = `الفئة غير صحيحة. القيم المسموحة: ${CATEGORIES.join(", ")}`;
  }

  const origin = typeof body.origin === "string" ? body.origin.trim() : "";
  if (origin.length < 2 || origin.length > 200) {
    fields.origin = "المصدر مطلوب.";
  }

  const shortDescription =
    typeof body.shortDescription === "string" ? body.shortDescription.trim() : "";
  if (shortDescription.length < 2 || shortDescription.length > 200) {
    fields.shortDescription = "الوصف القصير مطلوب.";
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (description.length < 2 || description.length > 5000) {
    fields.description = "الوصف الكامل مطلوب.";
  }

  const flavorNotesRaw = Array.isArray(body.flavorNotes) ? body.flavorNotes : [];
  const flavorNotes = flavorNotesRaw
    .filter((n): n is string => typeof n === "string" && n.trim().length > 0)
    .map((n) => n.trim());
  if (flavorNotes.length > MAX_FLAVOR_NOTES) {
    fields.flavorNotes = "عدد ملاحظات النكهة كبير جداً.";
  }

  const brewingRaw = (
    body.brewing && typeof body.brewing === "object" ? body.brewing : {}
  ) as Record<string, unknown>;
  const tempC = typeof brewingRaw.tempC === "number" ? brewingRaw.tempC : NaN;
  const steepMinutes =
    typeof brewingRaw.steepMinutes === "number" ? brewingRaw.steepMinutes : NaN;
  const brewingNotes =
    typeof brewingRaw.notes === "string" ? brewingRaw.notes.trim() : "";
  if (!Number.isFinite(tempC) || tempC < 0 || tempC > 100) {
    fields.brewing = "درجة حرارة التحضير غير صحيحة.";
  } else if (!Number.isFinite(steepMinutes) || steepMinutes < 0 || steepMinutes > 60) {
    fields.brewing = "مدة النقع غير صحيحة.";
  }

  const variantsRaw = Array.isArray(body.variants) ? body.variants : [];
  const variants: Variant[] = [];
  if (variantsRaw.length === 0) {
    fields.variants = "أضف حجماً واحداً على الأقل.";
  } else if (variantsRaw.length > MAX_VARIANTS) {
    fields.variants = "عدد الأحجام كبير جداً.";
  } else {
    for (const raw of variantsRaw as Record<string, unknown>[]) {
      const weightGrams =
        typeof raw.weightGrams === "number" ? raw.weightGrams : NaN;
      const priceMAD = typeof raw.priceMAD === "number" ? raw.priceMAD : NaN;
      if (!Number.isFinite(weightGrams) || weightGrams <= 0 || weightGrams > 100000) {
        fields.variants = "الوزن غير صحيح.";
        break;
      }
      if (!Number.isFinite(priceMAD) || priceMAD <= 0 || priceMAD > 100000) {
        fields.variants = "السعر غير صحيح.";
        break;
      }
      variants.push({
        weightGrams: weightGrams as WeightGrams,
        priceMAD,
        ...(raw.inStock === false ? { inStock: false as const } : {}),
      });
    }
  }

  const imagesRaw = Array.isArray(body.images) ? body.images : [];
  const images = imagesRaw.filter(
    (i): i is string => typeof i === "string" && i.trim().length > 0
  );
  if (images.length > MAX_IMAGES) {
    fields.images = "عدد الصور كبير جداً.";
  }

  const inStock = body.inStock !== false;

  if (Object.keys(fields).length > 0) {
    return { fields, value: null };
  }

  return {
    fields: {},
    value: {
      slug,
      name,
      category: category as Category,
      origin,
      shortDescription,
      description,
      flavorNotes,
      brewing: { tempC, steepMinutes, notes: brewingNotes },
      variants,
      images,
      inStock,
    },
  };
}
