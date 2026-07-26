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
import { ShoppingCart } from "lucide-react";

type ProductCardProps = {
  product: Product;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
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
        const tiltX = (y - 0.5) * -16;
        const tiltY = (x - 0.5) * 16;
        el.style.setProperty("--tilt-x", `${tiltX}deg`);
        el.style.setProperty("--tilt-y", `${tiltY}deg`);
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
      style={{ perspective: "800px" }}
    >
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="card-tilt relative overflow-hidden rounded-lg border brass-hairline bg-surface shadow-card group-hover:shadow-glow transition-shadow duration-300"
      >
        <div className="pointer-events-none absolute inset-0 card-specular opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        <Link href={`/product/${product.slug}`} className="block">
          <ProductImage
            product={product}
            className="aspect-[4/5] w-full"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline">{product.category}</Badge>
              {canOrder ? (
                <Badge variant="mint">متوفر</Badge>
              ) : (
                <Badge variant="muted">نفد المخزون</Badge>
              )}
            </div>
            <h3 className="font-display text-lg font-semibold group-hover:text-brass transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-ink-muted line-clamp-2">
              {product.shortDescription}
            </p>
            <div className="flex items-center justify-between pt-1">
              <Price
                amount={lowestPrice}
                className="text-brass font-semibold"
              />
              <span className="text-xs text-ink-muted" dir="ltr">
                {defaultWeight}g
              </span>
            </div>
          </div>
        </Link>

        {canOrder && (
          <div className="px-4 pb-4">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                addItem(product, defaultWeight);
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              أضف إلى السلة
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
