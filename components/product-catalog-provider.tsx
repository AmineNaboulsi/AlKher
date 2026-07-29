"use client";

import { createContext, useContext, useMemo } from "react";
import type { ProductDocument } from "@/lib/products-repo";

type ProductCatalogValue = {
  products: ProductDocument[];
  getBySlug: (slug: string) => ProductDocument | undefined;
};

const ProductCatalogContext = createContext<ProductCatalogValue | null>(null);

/**
 * Makes the (server-fetched) active product catalogue available to Client
 * Components — cart pricing, the cart drawer/view, checkout, and the promo
 * section all need synchronous product lookups, which a DB-backed catalogue
 * can no longer provide via a static import.
 */
export function ProductCatalogProvider({
  products,
  children,
}: {
  products: ProductDocument[];
  children: React.ReactNode;
}) {
  const value = useMemo<ProductCatalogValue>(() => {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return {
      products,
      getBySlug: (slug: string) => bySlug.get(slug),
    };
  }, [products]);

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
