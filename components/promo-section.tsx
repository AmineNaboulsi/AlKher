"use client";

import { Tag } from "lucide-react";
import { PROMOS, promoFullPrice, promoSaving } from "@/lib/promos";
import { useCart } from "@/lib/cart-context";
import { useProductCatalog } from "@/components/product-catalog-provider";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";

type PromoSectionProps = {
  className?: string;
  heading?: string;
};

export function PromoSection({
  className,
  heading = "عروض خاصة",
}: PromoSectionProps) {
  const { addPromo } = useCart();
  const { getBySlug } = useProductCatalog();

  if (PROMOS.length === 0) return null;

  return (
    <section className={cn("py-12 sm:py-16", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">
            {heading}
          </h2>
          <p className="text-ink-muted mt-2 text-sm sm:text-base">
            العرض يُحسب تلقائياً في السلة
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {PROMOS.map((promo) => {
            const fullPrice = promoFullPrice(getBySlug, promo);
            const saving = promoSaving(getBySlug, promo);
            const productsInPromo = promo.items.flatMap((item) => {
              const product = getBySlug(item.slug);
              return product ? [{ product, quantity: item.quantity }] : [];
            });

            return (
              <article
                key={promo.id}
                className="flex flex-col gap-4 rounded-lg border brass-hairline bg-surface p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-2.5 py-0.5 text-xs font-medium text-clay">
                      <Tag className="h-3 w-3" />
                      وفّر <Price amount={saving} />
                    </span>
                    <h3 className="font-display text-lg font-semibold">
                      {promo.name}
                    </h3>
                  </div>
                </div>

                <div className="flex gap-2">
                  {productsInPromo.map(({ product, quantity }) => (
                    <div key={product.slug} className="relative">
                      <ProductImage
                        product={product}
                        className="h-20 w-16 rounded-md"
                        sizes="64px"
                      />
                      {quantity > 1 && (
                        <span
                          className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-brass text-[10px] font-bold text-background"
                          dir="ltr"
                        >
                          ×{quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-sm text-ink-muted leading-relaxed flex-1">
                  {promo.description}
                </p>

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <Price
                      amount={promo.bundlePriceMAD}
                      className="font-display text-2xl font-bold text-brass"
                    />
                    <Price
                      amount={fullPrice}
                      className="ms-2 text-sm text-ink-muted line-through"
                    />
                  </div>
                  <Button
                    variant="brass"
                    size="sm"
                    onClick={() => addPromo(promo)}
                  >
                    أضف العرض
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
