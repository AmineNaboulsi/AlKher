import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Search } from "lucide-react";
import { queryProducts } from "@/lib/admin-products-repo";
import { CATEGORIES } from "@/lib/products";
import { DatabaseNotConfiguredError } from "@/lib/mongodb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product-image";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "لوحة المنتجات — الخير",
};

function firstParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function priceRange(variants: { priceMAD: number }[]): string {
  const prices = variants.map((v) => v.priceMAD);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? String(min) : `${min}–${max}`;
}

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const params = await searchParams;
  const filters = {
    search: firstParam(params.search),
    category: firstParam(params.category),
    status: firstParam(params.status),
  };

  let products: Awaited<ReturnType<typeof queryProducts>>["products"] = [];
  let fieldErrors: Awaited<ReturnType<typeof queryProducts>>["errors"] = {};
  let loadError: string | null = null;

  try {
    const result = await queryProducts(filters);
    products = result.products;
    fieldErrors = result.errors;
  } catch (error) {
    loadError =
      error instanceof DatabaseNotConfiguredError
        ? "قاعدة البيانات غير مهيّأة — راجع MONGODB_URI."
        : "تعذّر جلب المنتجات. حاول مرة أخرى.";
    console.error("[admin/products] failed to load products", error);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">المنتجات</h1>
          <p className="text-ink-muted mt-1">
            {products.length} منتج مطابق للتصفية
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            منتج جديد
          </Button>
        </Link>
      </div>

      <form
        method="get"
        className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg border brass-hairline bg-surface p-5"
      >
        <div className="lg:col-span-2 space-y-1.5">
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
              placeholder="لاس بالماس, las-palmas"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="category" className="text-xs font-medium text-ink-muted">
            الفئة
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category}
            className="flex h-10 w-full rounded-md border brass-hairline bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            <option value="">الكل</option>
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

        <div className="lg:col-span-4 flex justify-end gap-2">
          <Link href="/admin/products">
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

      {!loadError && products.length === 0 && (
        <div className="rounded-lg border brass-hairline bg-surface p-12 text-center text-ink-muted">
          لا توجد منتجات مطابقة للتصفية الحالية.
        </div>
      )}

      {!loadError && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((product) => (
            <Card key={product.slug} className="overflow-hidden">
              <ProductImage product={product} className="aspect-[4/3] w-full" />
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-lg truncate">
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-ink-muted mt-1" dir="ltr">
                    {product.slug}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {product.archived && <Badge variant="muted">مؤرشف</Badge>}
                  {product.inStock ? (
                    <Badge variant="mint">متوفر</Badge>
                  ) : (
                    <Badge variant="clay">نفد المخزون</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline">{product.category}</Badge>
                  <span className="font-semibold text-brass" dir="ltr">
                    {priceRange(product.variants)} د.م.
                  </span>
                </div>
                <p className="text-sm text-ink-muted line-clamp-2">
                  {product.shortDescription}
                </p>
                <Link
                  href={`/admin/products/${product.slug}/edit`}
                  className="block text-center text-sm text-majorelle hover:underline"
                >
                  تعديل
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
