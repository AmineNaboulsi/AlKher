"use client";

import { createContext, useContext, useMemo } from "react";
import type { ProductDocument } from "@/lib/products-repo";
import type { PromoDocument } from "@/lib/promos-repo";

type ProductCatalogValue = {
  products: ProductDocument[];
  getBySlug: (slug: string) => ProductDocument | undefined;
  promos: PromoDocument[];
  getPromoById: (id: string) => PromoDocument | undefined;
};

const ProductCatalogContext = createContext<ProductCatalogValue | null>(null);

/**
 * Makes the (server-fetched) active product catalogue and bundle promos
 * available to Client Components — cart pricing, the cart drawer/view,
 * checkout, and the promo section all need synchronous lookups, which a
 * DB-backed catalogue can no longer provide via a static import.
 */
export function ProductCatalogProvider({
  products,
  promos,
  children,
}: {
  products: ProductDocument[];
  promos: PromoDocument[];
  children: React.ReactNode;
}) {
  const value = useMemo<ProductCatalogValue>(() => {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    const promoById = new Map(promos.map((p) => [p.id, p]));
    return {
      products,
      getBySlug: (slug: string) => bySlug.get(slug),
      promos,
      getPromoById: (id: string) => promoById.get(id),
    };
  }, [products, promos]);

  return (
    <ProductCatalogContext.Provider value={value}>
      {children}
    </ProductCatalogContext.Provider>
  );
}

export function useProductCatalog() {
  const ctx = useContext(ProductCatalogContext);
  if (!ctx) {
    throw new Error(
      "useProductCatalog must be used within ProductCatalogProvider"
    );
  }
  return ctx;
}
