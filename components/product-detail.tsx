"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  ChevronLeft,
  Star,
  Truck,
  Wallet,
  PackageCheck,
  Thermometer,
  Timer,
} from "lucide-react";
import type { Product, WeightGrams } from "@/lib/products";
import { isVariantInStock } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductClipCard } from "@/components/product-clip-card";
import { Price } from "@/components/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/section-heading";
import { Footer } from "@/components/footer";
import { useTheme } from "@/components/theme-provider";
import { packPlate, productClip } from "@/lib/media";
import { SHOW_CATEGORIES } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type ProductDetailProps = {
  product: Product;
  related: Product[];
};

const assurances = [
  { icon: Truck, label: "توصيل لجميع المدن" },
  { icon: Wallet, label: "الخلاص عند التوصيل" },
  { icon: PackageCheck, label: "علبة مغلّفة من المورّد" },
];

const formatWeight = (grams: number) =>
  grams >= 1000 ? `${grams / 1000}kg` : `${grams}g`;

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
    product.inStock &&
    selectedVariant != null &&
    isVariantInStock(selectedVariant);

  const theme = useTheme();
  const clip = productClip(product.slug);
  const plate = packPlate(product.slug, theme);
  const gallery = plate ? [plate, ...product.images] : product.images;

  return (
    <>
      <div className="page-wash pb-16 pt-28 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="مسار التصفح" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              <li>
                <Link href="/" className="transition-colors hover:text-brass">
                  الرئيسية
                </Link>
              </li>
              <ChevronLeft className="h-4 w-4 text-ink-faint" />
              <li>
                <Link
                  href="/shop"
                  className="transition-colors hover:text-brass"
                >
                  المتجر
                </Link>
              </li>
              <ChevronLeft className="h-4 w-4 text-ink-faint" />
              <li className="truncate text-ink">{product.name}</li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Gallery — first column, which is the right-hand side in RTL. */}
            <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              {/* The relit plate leads, so the product page opens on the same
                  image the customer just clicked; the original photographs
                  follow, since those are what they came to inspect. */}
              <ProductGallery
                images={gallery}
                name={product.name}
                category={product.category}
              />
              {clip && (
                <ProductClipCard
                  src={clip.square}
                  poster={clip.poster}
                  label={`فيديو ${product.name}`}
                />
              )}
            </div>

            {/* Buy box */}
            <div className="space-y-7 text-start">
              <div className="space-y-4">
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

                <h1 className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">
                  {product.name}
                </h1>

                {product.rating && (
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <div className="flex text-brass" dir="ltr">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(product.rating!)
                              ? "fill-brass"
                              : "fill-none"
                          )}
                        />
                      ))}
                    </div>
                    <span dir="ltr">
                      {product.rating} ({product.reviewCount} تقييم)
                    </span>
                  </div>
                )}

                <p className="leading-relaxed text-ink-muted text-pretty">
                  {product.shortDescription}
                </p>
              </div>

              <div className="space-y-6 rounded-2xl border brass-hairline bg-surface p-6 shadow-card">
                <div className="flex items-end justify-between gap-4">
                  <Price
                    amount={price}
                    className="font-display text-4xl font-bold text-brass-light"
                  />
                  <span className="text-sm text-ink-faint" dir="ltr">
                    {formatWeight(selectedWeight)}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <p className="text-sm font-medium text-ink">الوزن</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const available = isVariantInStock(v);
                      return (
                        <button
                          key={v.weightGrams}
                          type="button"
                          disabled={!available}
                          onClick={() => setSelectedWeight(v.weightGrams)}
                          aria-pressed={selectedWeight === v.weightGrams}
                          aria-label={
                            available
                              ? `${v.weightGrams} غرام`
                              : `${v.weightGrams} غرام — نفد المخزون`
                          }
                          className={cn(
                            "rounded-full border px-5 py-2 text-sm transition-all",
                            !available
                              ? "cursor-not-allowed border-border text-ink-faint line-through"
                              : selectedWeight === v.weightGrams
                                ? "border-brass bg-brass/15 font-semibold text-brass-light"
                                : "border-border text-ink-muted hover:border-brass/50 hover:text-ink"
                          )}
                        >
                          <span dir="ltr">{formatWeight(v.weightGrams)}</span>
                        </button>
                      );
                    })}
                  </div>
                  {product.variants.some((v) => !isVariantInStock(v)) && (
                    <p className="text-xs text-ink-faint">
                      الأحجام المشطوبة نافدة حالياً.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2.5">
                    <p className="text-sm font-medium text-ink">الكمية</p>
                    <div className="inline-flex items-center rounded-full border brass-hairline bg-surface-raised">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="rounded-full p-2.5 transition-colors hover:text-brass"
                        aria-label="تقليل"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span
                        className="w-10 text-center font-display font-semibold"
                        dir="ltr"
                      >
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="rounded-full p-2.5 transition-colors hover:text-brass"
                        aria-label="زيادة"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Button
                    variant="brass"
                    size="xl"
                    className="flex-1"
                    disabled={!canOrder}
                    onClick={() => addItem(product, selectedWeight, quantity)}
                  >
                    {canOrder ? "أضف للسلة" : "غير متوفر حالياً"}
                  </Button>
                </div>

                <ul className="grid gap-2.5 border-t brass-hairline pt-5 text-sm text-ink-muted">
                  {assurances.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0 text-brass" />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              <Tabs defaultValue="description">
                <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
                  <TabsTrigger value="description">الوصف</TabsTrigger>
                  <TabsTrigger value="flavor">النكهة</TabsTrigger>
                  <TabsTrigger value="brewing">طريقة التحضير</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="description"
                  className="space-y-3 leading-relaxed text-ink-muted"
                >
                  <p className="text-pretty">{product.description}</p>
                  <p className="text-sm text-ink-faint">
                    المصدر: {product.origin}
                  </p>
                </TabsContent>

                <TabsContent value="flavor">
                  <ul className="flex flex-wrap gap-2">
                    {product.flavorNotes.map((note) => (
                      <li
                        key={note}
                        className="rounded-full border brass-hairline bg-surface px-4 py-1.5 text-sm text-ink-muted"
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="brewing" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border brass-hairline bg-surface p-4">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink-faint">
                        <Thermometer className="h-3.5 w-3.5 text-brass" />
                        الحرارة
                      </p>
                      <p
                        className="mt-1 font-display text-xl font-bold text-ink"
                        dir="ltr"
                      >
                        {product.brewing.tempC}°C
                      </p>
                    </div>
                    <div className="rounded-xl border brass-hairline bg-surface p-4">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink-faint">
                        <Timer className="h-3.5 w-3.5 text-brass" />
                        مدة النقع
                      </p>
                      <p
                        className="mt-1 font-display text-xl font-bold text-ink"
                        dir="ltr"
                      >
                        {product.brewing.steepMinutes} min
                      </p>
                    </div>
                  </div>
                  <p className="leading-relaxed text-ink-muted text-pretty">
                    {product.brewing.notes}
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t brass-hairline bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker="كيمشيو معه"
              title="علب أخرى من نفس الرفّ"
              action={{ href: "/shop", label: "كل المنتجات" }}
            />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
