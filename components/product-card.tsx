"use client";

import Link from "next/link";
import { useRef, useCallback } from "react";
import type { Product } from "@/lib/products";
import { isVariantInStock } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";
import { SHOW_CATEGORIES } from "@/lib/site-config";
import { Plus } from "lucide-react";

type ProductCardProps = {
  product: Product;
  className?: string;
  /** Set on the first card in a grid — it is usually the LCP element. */
  eager?: boolean;
};

export function ProductCard({ product, className, eager }: ProductCardProps) {
  const { addItem } = useCart();
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Only advertise sizes a customer can actually order.
  const orderable = product.variants.filter(isVariantInStock);
  const shown = orderable.length > 0 ? orderable : product.variants;
  const lowestPrice = Math.min(...shown.map((v) => v.priceMAD));
  const defaultWeight = shown[0].weightGrams;
  const canOrder = product.inStock && orderable.length > 0;

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
        return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const el = cardRef.current;
      if (!el) return;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        // Gentler than the light theme's tilt — on a dark card the specular
        // does the work, and a big rotation just smears the packshot.
        el.style.setProperty("--tilt-x", `${(y - 0.5) * -10}deg`);
        el.style.setProperty("--tilt-y", `${(x - 0.5) * 10}deg`);
        el.style.setProperty("--spec-x", `${x * 100}%`);
        el.style.setProperty("--spec-y", `${y * 100}%`);
      });
    },
    []
  );

  const handlePointerLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    el.style.setProperty("--spec-x", "50%");
    el.style.setProperty("--spec-y", "50%");
  }, []);

  return (
    <article
      className={cn("group relative", className)}
      style={{ perspective: "900px" }}
    >
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="card-tilt relative flex h-full flex-col overflow-hidden rounded-2xl border brass-hairline bg-surface shadow-card transition-colors duration-300 group-hover:border-brass/45 group-hover:shadow-glow"
      >
        <div className="pointer-events-none absolute inset-0 z-10 card-specular opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
          <div className="relative overflow-hidden">
            <ProductImage
              product={product}
              className="aspect-[4/5] w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              eager={eager}
            />
            {/* Grounds the packshot into the card instead of ending on a hard
                edge halfway down. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />

            <div className="absolute start-3 top-3 flex flex-col gap-1.5">
              {SHOW_CATEGORIES && (
                <Badge variant="outline" className="glass">
                  {product.category}
                </Badge>
              )}
              {!canOrder && <Badge variant="muted">نفد المخزون</Badge>}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 px-5 pb-2 pt-1">
            <h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-brass-light">
              {product.name}
            </h3>
            <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-ink-muted">
              {product.shortDescription}
            </p>

            <div className="flex items-baseline justify-between gap-2 border-t brass-hairline pt-3">
              <Price
                amount={lowestPrice}
                className="font-display text-xl font-bold text-brass-light"
              />
              <span className="text-xs text-ink-faint" dir="ltr">
                {defaultWeight}g
              </span>
            </div>
          </div>
        </Link>

        {canOrder && (
          <div className="px-5 pb-5 pt-3">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                addItem(product, defaultWeight);
              }}
            >
              <Plus className="h-4 w-4" />
              أضف للسلة
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
