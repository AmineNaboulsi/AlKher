"use client";

import Image from "next/image";
import type { Product } from "@/lib/products";
import { ProductPlaceholder } from "@/components/product-placeholder";
import { useTheme } from "@/components/theme-provider";
import { packPlate } from "@/lib/media";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  product: Product;
  className?: string;
  sizes?: string;
  /** Load immediately — use for the above-the-fold image on a product page. */
  eager?: boolean;
};

export function ProductImage({
  product,
  className,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  eager = false,
}: ProductImageProps) {
  const theme = useTheme();

  // Prefer the rendered plate: same crop, same light, same ground for every
  // product, graded for whichever theme is running. Falls back to the uploaded
  // photo for anything without one.
  const src = packPlate(product.slug, theme) ?? product.images[0];

  if (!src) {
    return (
      <ProductPlaceholder category={product.category} className={className} />
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-surface-raised", className)}>
      <Image
        src={src}
        alt={product.name}
        fill
        sizes={sizes}
        className="object-cover object-center"
        {...(eager
          ? { loading: "eager" as const, fetchPriority: "high" as const }
          : {})}
      />
    </div>
  );
}
