"use client";

import { Tag } from "lucide-react";
import { promoFullPrice, promoSaving } from "@/lib/promos";
import { useCart } from "@/lib/cart-context";
import { useProductCatalog } from "@/components/product-catalog-provider";
import { SectionHeading } from "@/components/section-heading";
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
  const { getBySlug, promos } = useProductCatalog();

  if (promos.length === 0) return null;

  return (
    <section
      className={cn(
        "relative overflow-hidden border-y brass-hairline bg-surface py-20 sm:py-24",
        className
      )}
    >
      {/* Clay bloom — the only warm-red light on the page, so an offer reads as
          an offer without a single "SALE" sticker. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_85%_0%,rgba(212,82,44,0.1),transparent_62%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="وفّر أكثر"
          title={heading}
          blurb="العرض كيتحسب أوتوماتيكياً فالسلة — سواء زدتيه من هنا أو جمعتي نفس العلب بيدك."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {promos.map((promo) => {
            const fullPrice = promoFullPrice(getBySlug, promo);
            const saving = promoSaving(getBySlug, promo);
            const productsInPromo = promo.items.flatMap((item) => {
              const product = getBySlug(item.slug);
              return product ? [{ product, quantity: item.quantity }] : [];
            });

            return (
              <article
                key={promo.id}
                className="group flex flex-col gap-5 rounded-2xl border brass-hairline bg-surface-raised p-6 shadow-card transition-colors duration-300 hover:border-brass/45"
              >
                <div className="space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-clay/18 px-3 py-1 text-xs font-semibold text-clay ring-1 ring-inset ring-clay/30">
                    <Tag className="h-3 w-3" />
                    وفّر <Price amount={saving} />
                  </span>
                  <h3 className="font-display text-xl font-semibold">
                    {promo.name}
                  </h3>
                </div>

                <div className="flex gap-2.5">
                  {productsInPromo.map(({ product, quantity }) => (
                    <div key={product.slug} className="relative">
                      <ProductImage
                        product={product}
                        className="h-24 w-20 rounded-lg border brass-hairline"
                        sizes="80px"
                      />
                      {quantity > 1 && (
                        <span
                          className="absolute -top-1.5 -end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brass text-[10px] font-bold text-night"
                          dir="ltr"
                        >
                          ×{quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <p className="flex-1 text-sm leading-relaxed text-ink-muted">
                  {promo.description}
                </p>

                <div className="flex flex-wrap items-end justify-between gap-3 border-t brass-hairline pt-4">
                  <div className="flex items-baseline gap-2.5">
                    <Price
                      amount={promo.bundlePriceMAD}
                      className="font-display text-2xl font-bold text-brass-light"
                    />
                    <Price
                      amount={fullPrice}
                      className="text-sm text-ink-faint line-through"
                    />
                  </div>
                  <Button variant="brass" onClick={() => addPromo(promo)}>
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
