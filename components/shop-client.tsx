"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  products,
  CATEGORIES,
  isVariantInStock,
  type Product,
} from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { PromoSection } from "@/components/promo-section";
import { Footer } from "@/components/footer";
import { ZelligeDivider } from "@/components/zellige-divider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type ShopClientProps = {
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

export function ShopClient({ initialCategory }: ShopClientProps) {
  const [category, setCategory] = useState<string>(initialCategory ?? "all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

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
  }, [category, sort, inStockOnly, maxPrice]);

  const resetFilters = () => {
    setCategory("all");
    setSort("newest");
    setInStockOnly(false);
    setMaxPrice(MAX_PRICE);
  };

  return (
    <>
      <div className="pt-24 pb-12 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-ink-muted mb-6">
            <Link href="/" className="hover:text-ink transition-colors">
              الرئيسية
            </Link>
            <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
            <span className="text-ink">المتجر</span>
          </nav>

          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            المتجر
          </h1>
          <p className="text-ink-muted mb-8">
            {filtered.length} منتج — شاي أخضر صيني للأتاي المغربي
          </p>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters sidebar */}
            <aside className="lg:w-56 shrink-0 space-y-6">
              <div>
                <h2 className="text-sm font-semibold mb-3">الفئة</h2>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={category === "all"}
                      onChange={() => setCategory("all")}
                      className="accent-brass"
                    />
                    الكل
                  </label>
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={category === cat}
                        onChange={() => setCategory(cat)}
                        className="accent-brass"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold mb-3">
                  السعر الأقصى:{" "}
                  <span dir="ltr">{maxPrice} د.م.</span>
                </h2>
                <input
                  type="range"
                  min={20}
                  max={MAX_PRICE}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brass"
                />
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-brass"
                />
                متوفر فقط
              </label>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <Select
                  value={sort}
                  onValueChange={(v) => setSort(v as SortOption)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="ترتيب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">الأحدث</SelectItem>
                    <SelectItem value="price-asc">
                      السعر: من الأقل
                    </SelectItem>
                    <SelectItem value="price-desc">
                      السعر: من الأعلى
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <p className="text-ink-muted text-lg">
                    لا توجد نتائج مطابقة — جرّب تعديل الفلاتر
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    إعادة ضبط الفلاتر
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
      </div>
      <ZelligeDivider variant="compact" />
      <PromoSection className="pt-0" />
      <Footer />
    </>
  );
}
