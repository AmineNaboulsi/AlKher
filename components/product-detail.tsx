"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ChevronRight, Star } from "lucide-react";
import type { Product, WeightGrams } from "@/lib/products";
import { isVariantInStock } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { Price } from "@/components/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZelligeDivider } from "@/components/zellige-divider";
import { Footer } from "@/components/footer";
import { SHOW_CATEGORIES } from "@/lib/site-config";

type ProductDetailProps = {
  product: Product;
  related: Product[];
};

export function ProductDetail({ product, related }: ProductDetailProps) {
  const { addItem } = useCart();
  // Start on a size that can actually be bought.
  const [selectedWeight, setSelectedWeight] = useState<WeightGrams>(
    (product.variants.find(isVariantInStock) ?? product.variants[0]).weightGrams
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product.variants.find(
    (v) => v.weightGrams === selectedWeight
  );
  const price = selectedVariant?.priceMAD ?? 0;
  const canOrder =
    product.inStock && selectedVariant != null && isVariantInStock(selectedVariant);

  return (
    <>
      <div className="pt-24 pb-12 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8">
            <Link href="/" className="hover:text-ink transition-colors">
              الرئيسية
            </Link>
            <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
            <Link href="/shop" className="hover:text-ink transition-colors">
              المتجر
            </Link>
            <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
            <span className="text-ink truncate">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Gallery — on the right in RTL flow (first column) */}
            <ProductGallery
              images={product.images}
              name={product.name}
              category={product.category}
            />

            {/* Details */}
            <div className="space-y-6 text-start">
              <div className="flex flex-wrap items-center gap-2">
                {SHOW_CATEGORIES && (
                  <Badge variant="outline">{product.category}</Badge>
                )}
                {product.inStock ? (
                  <Badge variant="mint">متوفر</Badge>
                ) : (
                  <Badge variant="muted">نفد المخزون</Badge>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                {product.name}
              </h1>

              {product.rating && (
                <div className="flex items-center gap-2 text-sm text-ink-muted">
                  <div className="flex text-brass" dir="ltr">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating!)
                            ? "fill-brass"
                            : "fill-none"
                        }`}
                      />
                    ))}
                  </div>
                  <span dir="ltr">
                    {product.rating} ({product.reviewCount} تقييم)
                  </span>
                </div>
              )}

              <p className="text-ink-muted">{product.shortDescription}</p>
              <p className="text-sm text-ink-muted">
                المصدر: {product.origin}
              </p>

              <Price
                amount={price}
                className="text-3xl font-bold text-brass"
              />

              {/* Weight selector */}
              <div>
                <p className="text-sm font-medium mb-2">الوزن</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const available = isVariantInStock(v);
                    return (
                      <button
                        key={v.weightGrams}
                        type="button"
                        disabled={!available}
                        onClick={() => setSelectedWeight(v.weightGrams)}
                        aria-label={
                          available
                            ? `${v.weightGrams} غرام`
                            : `${v.weightGrams} غرام — نفد المخزون`
                        }
                        className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                          !available
                            ? "border-border text-ink-muted/50 line-through cursor-not-allowed"
                            : selectedWeight === v.weightGrams
                              ? "border-brass bg-brass/10 text-brass"
                              : "border-border text-ink-muted hover:border-brass/50"
                        }`}
                      >
                        <span dir="ltr">
                          {v.weightGrams >= 1000
                            ? `${v.weightGrams / 1000}kg`
                            : `${v.weightGrams}g`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {product.variants.some((v) => !isVariantInStock(v)) && (
                  <p className="mt-2 text-xs text-ink-muted">
                    الأحجام المشطوبة نفدت من المخزون حالياً.
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <p className="text-sm font-medium mb-2">الكمية</p>
                <div className="inline-flex items-center border brass-hairline rounded-md">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-surface transition-colors"
                    aria-label="تقليل"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center" dir="ltr">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-surface transition-colors"
                    aria-label="زيادة"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button
                variant="brass"
                size="lg"
                className="w-full sm:w-auto"
                disabled={!canOrder}
                onClick={() => addItem(product, selectedWeight, quantity)}
              >
                {canOrder ? "أضف إلى السلة" : "غير متوفر حالياً"}
              </Button>

              <Tabs defaultValue="description" className="pt-4">
                <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
                  <TabsTrigger value="description">الوصف</TabsTrigger>
                  <TabsTrigger value="flavor">نكهة وملاحظات</TabsTrigger>
                  <TabsTrigger value="brewing">طريقة التحضير</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="text-ink-muted leading-relaxed">
                  {product.description}
                </TabsContent>
                <TabsContent value="flavor">
                  <ul className="space-y-2">
                    {product.flavorNotes.map((note) => (
                      <li
                        key={note}
                        className="flex items-center gap-2 text-ink-muted"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="brewing" className="space-y-3 text-ink-muted">
                  <p>
                    درجة الحرارة:{" "}
                    <span dir="ltr">{product.brewing.tempC}°C</span>
                  </p>
                  <p>
                    مدة النقع:{" "}
                    <span dir="ltr">{product.brewing.steepMinutes}</span>{" "}
                    دقائق
                  </p>
                  <p>{product.brewing.notes}</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-2xl font-semibold mb-6">
                منتجات مشابهة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <ZelligeDivider variant="compact" />
      <Footer />
    </>
  );
}
