import Image from "next/image";
import type { Product } from "@/lib/products";
import { ProductPlaceholder } from "@/components/product-placeholder";
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
  const src = product.images[0];

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
