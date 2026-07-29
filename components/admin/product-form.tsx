"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2, Upload } from "lucide-react";
import type { ProductDocument } from "@/lib/products-repo";
import { CATEGORIES, type Category, type Variant } from "@/lib/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ProductFormProps = {
  /** Omit for create mode. */
  product?: ProductDocument;
};

type FieldErrors = Partial<
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

const COMMON_WEIGHTS = [50, 100, 200, 250, 500, 1000] as const;

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [category, setCategory] = useState<Category>(
    product?.category ?? CATEGORIES[0]
  );
  const [origin, setOrigin] = useState(product?.origin ?? "");
  const [shortDescription, setShortDescription] = useState(
    product?.shortDescription ?? ""
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [flavorNotes, setFlavorNotes] = useState<string[]>(
    product?.flavorNotes ?? []
  );
  const [flavorNoteInput, setFlavorNoteInput] = useState("");
  const [tempC, setTempC] = useState(product?.brewing.tempC ?? 100);
  const [steepMinutes, setSteepMinutes] = useState(
    product?.brewing.steepMinutes ?? 4
  );
  const [brewingNotes, setBrewingNotes] = useState(product?.brewing.notes ?? "");
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants ?? [{ weightGrams: 200, priceMAD: 20 }]
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [archived, setArchived] = useState(product?.archived ?? false);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function addFlavorNote() {
    const value = flavorNoteInput.trim();
    if (!value) return;
    setFlavorNotes((prev) => [...prev, value]);
    setFlavorNoteInput("");
  }

  function removeFlavorNote(index: number) {
    setFlavorNotes((prev) => prev.filter((_, i) => i !== index));
  }

  function addVariant() {
    setVariants((prev) => [...prev, { weightGrams: 200, priceMAD: 0 }]);
  }

  function updateVariant(index: number, patch: Partial<Variant>) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setFormError(null);
    try {
      for (const file of Array.from(fileList)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/products/images", {
          method: "POST",
          body,
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error ?? "تعذّر رفع الصورة.");
          continue;
        }
        setImages((prev) => [...prev, data.url as string]);
      }
    } catch {
      setFormError("تعذّر الاتصال بالخادم أثناء رفع الصورة.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const body = {
      name,
      slug,
      category,
      origin,
      shortDescription,
      description,
      flavorNotes,
      brewing: { tempC, steepMinutes, notes: brewingNotes },
      variants,
      images,
      inStock,
      ...(isEdit ? { archived } : {}),
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/products/${product!.slug}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "تعذّر حفظ المنتج.");
        setFieldErrors(data.fields ?? {});
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setFormError("تعذّر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl" noValidate>
      {formError && (
        <p
          role="alert"
          className="rounded-md border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay"
        >
          {formError}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">المعلومات الأساسية</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">الاسم</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
            {fieldErrors.name && (
              <p className="text-xs text-clay">{fieldErrors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">المعرّف (slug)</label>
            <Input
              value={slug}
              dir="ltr"
              onChange={(e) => setSlug(e.target.value)}
              onBlur={() => setSlug((s) => slugify(s))}
              placeholder="green-tea-500g"
              required
            />
            {fieldErrors.slug && (
              <p className="text-xs text-clay">{fieldErrors.slug}</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">الفئة</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="flex h-10 w-full rounded-md border brass-hairline bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p className="text-xs text-clay">{fieldErrors.category}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">المصدر</label>
            <Input value={origin} onChange={(e) => setOrigin(e.target.value)} required />
            {fieldErrors.origin && (
              <p className="text-xs text-clay">{fieldErrors.origin}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">وصف قصير</label>
          <Input
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
          />
          {fieldErrors.shortDescription && (
            <p className="text-xs text-clay">{fieldErrors.shortDescription}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">الوصف الكامل</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            className="flex w-full rounded-md border brass-hairline bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          />
          {fieldErrors.description && (
            <p className="text-xs text-clay">{fieldErrors.description}</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">ملاحظات النكهة</h2>
        <div className="flex flex-wrap gap-2">
          {flavorNotes.map((note, i) => (
            <span
              key={`${note}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-3 py-1 text-sm"
            >
              {note}
              <button
                type="button"
                onClick={() => removeFlavorNote(i)}
                className="text-ink-muted hover:text-clay"
                aria-label="حذف"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={flavorNoteInput}
            onChange={(e) => setFlavorNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFlavorNote();
              }
            }}
            placeholder="مثال: عطري خفيف"
          />
          <Button type="button" variant="outline" onClick={addFlavorNote}>
            إضافة
          </Button>
        </div>
        {fieldErrors.flavorNotes && (
          <p className="text-xs text-clay">{fieldErrors.flavorNotes}</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">طريقة التحضير</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">درجة الحرارة (°C)</label>
            <Input
              type="number"
              value={tempC}
              onChange={(e) => setTempC(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">مدة النقع (دقائق)</label>
            <Input
              type="number"
              value={steepMinutes}
              onChange={(e) => setSteepMinutes(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">ملاحظات التحضير</label>
          <textarea
            value={brewingNotes}
            onChange={(e) => setBrewingNotes(e.target.value)}
            rows={2}
            className="flex w-full rounded-md border brass-hairline bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          />
        </div>
        {fieldErrors.brewing && (
          <p className="text-xs text-clay">{fieldErrors.brewing}</p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">الأحجام والأسعار</h2>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="h-4 w-4" /> إضافة حجم
          </Button>
        </div>
        <div className="space-y-3">
          {variants.map((variant, i) => (
            <div
              key={i}
              className="flex flex-wrap items-end gap-3 rounded-md border brass-hairline p-3"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink-muted">
                  الوزن (غ)
                </label>
                <select
                  value={variant.weightGrams}
                  onChange={(e) =>
                    updateVariant(i, {
                      weightGrams: Number(e.target.value) as Variant["weightGrams"],
                    })
                  }
                  className="flex h-10 rounded-md border brass-hairline bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                >
                  {COMMON_WEIGHTS.map((w) => (
                    <option key={w} value={w}>
                      {w >= 1000 ? `${w / 1000}kg` : `${w}g`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink-muted">
                  السعر (د.م.)
                </label>
                <Input
                  type="number"
                  value={variant.priceMAD}
                  onChange={(e) =>
                    updateVariant(i, { priceMAD: Number(e.target.value) })
                  }
                  className="w-28"
                />
              </div>
              <label className="flex items-center gap-2 text-sm pb-2">
                <input
                  type="checkbox"
                  checked={variant.inStock !== false}
                  onChange={(e) =>
                    updateVariant(i, {
                      inStock: e.target.checked ? undefined : false,
                    })
                  }
                  className="accent-brass"
                />
                متوفر
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeVariant(i)}
                className="ms-auto text-clay"
                aria-label="حذف الحجم"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {fieldErrors.variants && (
          <p className="text-xs text-clay">{fieldErrors.variants}</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">الصور</h2>
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div
              key={src}
              className="relative h-24 w-24 overflow-hidden rounded-md border brass-hairline"
            >
              <Image src={src} alt="" fill className="object-cover" sizes="96px" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-scrim/70 px-1 py-0.5">
                <button
                  type="button"
                  onClick={() => moveImage(i, -1)}
                  disabled={i === 0}
                  className="text-white disabled:opacity-30"
                  aria-label="تحريك للأعلى"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="text-white hover:text-clay"
                  aria-label="حذف الصورة"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(i, 1)}
                  disabled={i === images.length - 1}
                  className="text-white disabled:opacity-30"
                  aria-label="تحريك للأسفل"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed brass-hairline text-ink-muted hover:border-brass/50 hover:text-brass transition-colors">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            <span className="text-xs">إضافة</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
              disabled={uploading}
            />
          </label>
        </div>
        {fieldErrors.images && (
          <p className="text-xs text-clay">{fieldErrors.images}</p>
        )}
      </section>

      <section className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="accent-brass"
          />
          متوفر في المتجر
        </label>
        {isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
              className="accent-brass"
            />
            مؤرشف (مخفي عن المتجر)
          </label>
        )}
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting || uploading}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "حفظ التعديلات" : "إنشاء المنتج"}
        </Button>
      </div>
    </form>
  );
}
