import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Search, Tag } from "lucide-react";
import { queryPromos } from "@/lib/admin-promos-repo";
import { getActiveProducts } from "@/lib/products-repo";
import { promoFullPrice, promoSaving, type CatalogLookup } from "@/lib/promos";
import { DatabaseNotConfiguredError } from "@/lib/mongodb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "لوحة العروض — الخير",
};

function firstParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function AdminPromosPage({
  searchParams,
}: PageProps<"/admin/promos">) {
  const params = await searchParams;
  const filters = {
    search: firstParam(params.search),
    status: firstParam(params.status),
  };

  let promos: Awaited<ReturnType<typeof queryPromos>>["promos"] = [];
  let fieldErrors: Awaited<ReturnType<typeof queryPromos>>["errors"] = {};
  let loadError: string | null = null;
  let catalog: CatalogLookup = () => undefined;
  let productNames = new Map<string, string>();

  try {
    const [result, products] = await Promise.all([
      queryPromos(filters),
      getActiveProducts(),
    ]);
    promos = result.promos;
    fieldErrors = result.errors;
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    catalog = (slug) => bySlug.get(slug);
    productNames = new Map(products.map((p) => [p.slug, p.name]));
  } catch (error) {
    loadError =
      error instanceof DatabaseNotConfiguredError
        ? "قاعدة البيانات غير مهيّأة — راجع MONGODB_URI."
        : "تعذّر جلب العروض. حاول مرة أخرى.";
    console.error("[admin/promos] failed to load promos", error);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">العروض</h1>
          <p className="text-ink-muted mt-1">{promos.length} عرض مطابق للتصفية</p>
        </div>
        <Link href="/admin/promos/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            عرض جديد
          </Button>
        </Link>
      </div>

      <form
        method="get"
        className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-lg border brass-hairline bg-surface p-5"
      >
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="search" className="text-xs font-medium text-ink-muted">
            بحث (الاسم أو المعرّف)
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              id="search"
              name="search"
              defaultValue={filters.search}
              className="ps-9"
              placeholder="الثلاثية, trio-200g"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="status" className="text-xs font-medium text-ink-muted">
            الحالة
          </label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status}
            className="flex h-10 w-full rounded-md border brass-hairline bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            <option value="">الكل</option>
            <option value="active">مفعّل</option>
            <option value="archived">مؤرشف</option>
          </select>
          {fieldErrors.status && (
            <p className="text-xs text-clay">{fieldErrors.status}</p>
          )}
        </div>

        <div className="sm:col-span-3 flex justify-end gap-2">
          <Link href="/admin/promos">
            <Button type="button" variant="ghost" size="sm">
              إعادة ضبط
            </Button>
          </Link>
          <Button type="submit" size="sm">
            تصفية
          </Button>
        </div>
      </form>

      {loadError && (
        <div className="rounded-lg border brass-hairline bg-surface p-8 text-center text-clay">
          {loadError}
        </div>
      )}

      {!loadError && promos.length === 0 && (
        <div className="rounded-lg border brass-hairline bg-surface p-12 text-center text-ink-muted">
          لا توجد عروض مطابقة للتصفية الحالية.
        </div>
      )}

      {!loadError && promos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {promos.map((promo) => {
            const fullPrice = promoFullPrice(catalog, promo);
            const saving = promoSaving(catalog, promo);
            return (
              <Card key={promo.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-lg truncate">{promo.name}</CardTitle>
                    <p className="text-sm text-ink-muted mt-1" dir="ltr">
                      {promo.id}
                    </p>
                  </div>
                  {promo.archived && <Badge variant="muted">مؤرشف</Badge>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="text-sm text-ink-muted space-y-1">
                    {promo.items.map((item) => (
                      <li key={`${item.slug}-${item.weightGrams}`}>
                        {productNames.get(item.slug) ?? item.slug} —{" "}
                        <span dir="ltr">
                          {item.weightGrams}g × {item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between border-t brass-hairline pt-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-2.5 py-0.5 text-xs font-medium text-clay">
                      <Tag className="h-3 w-3" />
                      <span dir="ltr">وفّر {saving} د.م.</span>
                    </span>
                    <div className="text-end">
                      <span className="font-semibold text-brass" dir="ltr">
                        {promo.bundlePriceMAD} د.م.
                      </span>
                      <span
                        className="text-ink-muted text-xs line-through ms-1"
                        dir="ltr"
                      >
                        {fullPrice} د.م.
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/promos/${promo.id}/edit`}
                    className="block text-center text-sm text-majorelle hover:underline"
                  >
                    تعديل
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
