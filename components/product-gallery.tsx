"use client";

import { useState } from "react";
import Image from "next/image";
import type { Category } from "@/lib/products";
import { ProductPlaceholder } from "@/components/product-placeholder";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  name: string;
  category: Category;
  className?: string;
};

/** One big image with a row of small thumbnails below it when there's more than one. */
export function ProductGallery({
  images,
  name,
  category,
  className,
}: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const src = images[selected];

  if (!src) {
    return (
      <ProductPlaceholder
        category={category}
        className={cn("aspect-[4/5] w-full rounded-lg", className)}
      />
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border brass-hairline bg-surface-raised">
        <Image
          key={src}
          src={src}
          alt={name}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`صورة ${index + 1}`}
              aria-current={selected === index}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                selected === index
                  ? "border-brass"
                  : "border-transparent hover:border-brass/40"
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="64px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
