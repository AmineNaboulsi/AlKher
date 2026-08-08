"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { CATEGORIES, isVariantInStock, type Product } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { PromoSection } from "@/components/promo-section";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { plates } from "@/lib/media";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SHOW_CATEGORIES } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type ShopClientProps = {
  products: Product[];
  initialCategory?: string;
};

type SortOption = "newest" | "price-asc" | "price-desc";

const MAX_PRICE = 60;

function getLowestPrice(p: Product) {
  // Sort and filter on sizes a customer can actually order.
  const orderable = p.variants.filter(isVariantInStock);
  const shown = orderable.length > 0 ? orderable : p.variants;
  return Math.min(...shown.map((v) => v.priceMAD));
}

export function ShopClient({ products, initialCategory }: ShopClientProps) {
  // With categories hidden there is no way to change this, and a stale
  // ?category= link must not silently filter the listing down.
  const [category, setCategory] = useState<string>(
    SHOW_CATEGORIES ? initialCategory ?? "all" : "all"
  );
  const [sort, setSort] = useState<SortOption>("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }
    result = result.filter((p) => getLowestPrice(p) <= maxPrice);

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
        break;
      case "price-desc":
        result.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
        break;
      default:
        break;
    }

    return result;
  }, [products, category, sort, inStockOnly, maxPrice]);

  const resetFilters = () => {
    setCategory("all");
    setSort("newest");
    setInStockOnly(false);
    setMaxPrice(MAX_PRICE);
  };

  const isFiltered =
    category !== "all" || inStockOnly || maxPrice !== MAX_PRICE;

  return (
    <>
      <PageHeader
        plate={plates.shopHeader}
        kicker="المتجر"
        title="كل العلب اللي كنوفّرو"
        blurb="شاي أخضر صيني للأتاي المغربي — بأثمنة المحل، والخلاص عند التوصيل."
        crumbs={[{ href: "/", label: "الرئيسية" }, { label: "المتجر" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Filters. Collapsed behind a button on phones, where a permanently
              expanded sidebar would push the grid a full screen down. */}
          <aside className="lg:w-60 lg:shrink-0">
            <Button
              variant="secondary"
              className="w-full lg:hidden"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal className="h-4 w-4" />
              الفلاتر
              {isFiltered && (
                <span className="ms-1 h-1.5 w-1.5 rounded-full bg-brass" />
              )}
            </Button>

            <div
              className={cn(
                "mt-4 space-y-7 rounded-2xl border brass-hairline bg-surface p-5 lg:mt-0 lg:sticky lg:top-24",
                filtersOpen ? "block" : "hidden lg:block"
              )}
            >
              {SHOW_CATEGORIES && (
                <fieldset className="space-y-3">
                  <legend className="font-display text-sm font-semibold text-brass">
                    النوع
                  </legend>
                  {[{ value: "all", label: "الكل" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))].map(
                    (option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted transition-colors hover:text-ink"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={category === option.value}
                          onChange={() => setCategory(option.value)}
                          className="accent-brass"
                        />
                        {option.label}
                      </label>
                    )
                  )}
                </fieldset>
              )}

              <div className="space-y-3">
                <h2 className="font-display text-sm font-semibold text-brass">
                  السعر الأقصى
                </h2>
                <p
                  className="font-display text-lg font-bold text-ink"
                  dir="ltr"
                >
                  {maxPrice} د.م.
                </p>
                <input
                  type="range"
                  min={20}
                  max={MAX_PRICE}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brass"
                  aria-label="السعر الأقصى"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 border-t brass-hairline pt-5 text-sm text-ink-muted transition-colors hover:text-ink">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-brass"
                />
                المتوفر فقط
              </label>

              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={resetFilters}
                >
                  إعادة الضبط
                </Button>
              )}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b brass-hairline pb-4">
              <p className="text-sm text-ink-muted">
                <span className="font-display text-lg font-bold text-ink">
                  {filtered.length}
                </span>{" "}
                منتج
              </p>

              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortOption)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="ترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="price-asc">السعر: من الأقل</SelectItem>
                  <SelectItem value="price-desc">السعر: من الأعلى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filtered.length === 0 ? (
              <div className="space-y-4 rounded-2xl border border-dashed brass-hairline py-20 text-center">
                <p className="text-lg text-ink-muted">
                  ما لقينا حتى نتيجة — جرّب تبدّل الفلاتر
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  إعادة ضبط الفلاتر
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product, index) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    eager={index === 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <PromoSection />
      <Footer />
    </>
  );
}
