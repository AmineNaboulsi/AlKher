"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { ProductDocument } from "@/lib/products-repo";
import type { PromoDocument } from "@/lib/promos-repo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PromoFormProps = {
  /** Omit for create mode. */
  promo?: PromoDocument;
  products: ProductDocument[];
};

type PromoItem = { slug: string; weightGrams: number; quantity: number };

type FieldErrors = Partial<
  Record<"id" | "name" | "description" | "items" | "bundlePriceMAD", string>
>;

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PromoForm({ promo, products }: PromoFormProps) {
  const router = useRouter();
  const isEdit = Boolean(promo);
  const productsBySlug = new Map(products.map((p) => [p.slug, p]));

  const [id, setId] = useState(promo?.id ?? "");
  const [name, setName] = useState(promo?.name ?? "");
  const [description, setDescription] = useState(promo?.description ?? "");
  const [bundlePriceMAD, setBundlePriceMAD] = useState(promo?.bundlePriceMAD ?? 0);
  const [items, setItems] = useState<PromoItem[]>(
    promo?.items ??
      (products[0]
        ? [
            {
              slug: products[0].slug,
              weightGrams: products[0].variants[0]?.weightGrams ?? 0,
              quantity: 1,
            },
          ]
        : [])
  );
  const [archived, setArchived] = useState(promo?.archived ?? false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function addItem() {
    const first = products[0];
    if (!first) return;
    setItems((prev) => [
      ...prev,
      { slug: first.slug, weightGrams: first.variants[0]?.weightGrams ?? 0, quantity: 1 },
    ]);
  }

  function updateItem(index: number, patch: Partial<PromoItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const body = {
      id,
      name,
      description,
      items,
      bundlePriceMAD,
      ...(isEdit ? { archived } : {}),
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/promos/${promo!.id}` : "/api/admin/promos",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "تعذّر حفظ العرض.");
        setFieldErrors(data.fields ?? {});
        return;
      }

      router.push("/admin/promos");
      router.refresh();
    } catch {
      setFormError("تعذّر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  if (products.length === 0) {
    return (
      <p className="text-ink-muted">
        لا توجد منتجات مفعّلة بعد — أضف منتجاً أولاً من{" "}
        <Link href="/admin/products/new" className="text-majorelle hover:underline">
          صفحة المنتجات
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl" noValidate>
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
            <label className="text-sm font-medium">المعرّف</label>
            <Input
              value={id}
              dir="ltr"
              onChange={(e) => setId(e.target.value)}
              onBlur={() => setId((s) => slugify(s))}
              placeholder="duo-green-tea"
              required
            />
            {fieldErrors.id && <p className="text-xs text-clay">{fieldErrors.id}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
            className="flex w-full rounded-md border brass-hairline bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          />
          {fieldErrors.description && (
            <p className="text-xs text-clay">{fieldErrors.description}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">سعر العرض (د.م.)</label>
          <Input
            type="number"
            value={bundlePriceMAD}
            onChange={(e) => setBundlePriceMAD(Number(e.target.value))}
            className="w-40"
            required
          />
          {fieldErrors.bundlePriceMAD && (
            <p className="text-xs text-clay">{fieldErrors.bundlePriceMAD}</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">محتويات العرض</h2>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" /> إضافة منتج
          </Button>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => {
            const product = productsBySlug.get(item.slug);
            const variants = product?.variants ?? [];
            return (
              <div
                key={i}
                className="flex flex-wrap items-end gap-3 rounded-md border brass-hairline p-3"
              >
                <div className="space-y-1.5 min-w-40">
                  <label className="text-xs font-medium text-ink-muted">المنتج</label>
                  <select
                    value={item.slug}
                    onChange={(e) => {
                      const newProduct = productsBySlug.get(e.target.value);
                      updateItem(i, {
                        slug: e.target.value,
                        weightGrams: newProduct?.variants[0]?.weightGrams ?? 0,
                      });
                    }}
                    className="flex h-10 w-full rounded-md border brass-hairline bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                  >
                    {products.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink-muted">الوزن</label>
                  <select
                    value={item.weightGrams}
                    onChange={(e) =>
                      updateItem(i, { weightGrams: Number(e.target.value) })
                    }
                    className="flex h-10 rounded-md border brass-hairline bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                  >
                    {variants.map((v) => (
                      <option key={v.weightGrams} value={v.weightGrams}>
                        {v.weightGrams >= 1000 ? `${v.weightGrams / 1000}kg` : `${v.weightGrams}g`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink-muted">الكمية</label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(i, { quantity: Number(e.target.value) })
                    }
                    className="w-24"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(i)}
                  className="ms-auto text-clay"
                  aria-label="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
        {fieldErrors.items && <p className="text-xs text-clay">{fieldErrors.items}</p>}
      </section>

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

      <Button type="submit" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isEdit ? "حفظ التعديلات" : "إنشاء العرض"}
      </Button>
    </form>
  );
}
