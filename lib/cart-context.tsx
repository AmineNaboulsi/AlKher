"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type Product, type WeightGrams } from "./products";
import { priceCart, type PricedCart, type Promo } from "./promos";
import { useProductCatalog } from "@/components/product-catalog-provider";

export type CartItem = {
  productSlug: string;
  weightGrams: WeightGrams;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (
    product: Product,
    weightGrams: WeightGrams,
    quantity?: number
  ) => void;
  /** Adds every item a bundle offer requires, so the offer price kicks in. */
  addPromo: (promo: Promo, quantity?: number) => void;
  removeItem: (productSlug: string, weightGrams: number) => void;
  updateQuantity: (
    productSlug: string,
    weightGrams: number,
    quantity: number
  ) => void;
  clearCart: () => void;
  itemCount: number;
  /** Promo-aware subtotal — matches what `/api/orders` will charge. */
  subtotal: number;
  pricing: PricedCart;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "alkhayr-cart";

function getItemPrice(product: Product, weightGrams: number): number {
  return (
    product.variants.find((v) => v.weightGrams === weightGrams)?.priceMAD ?? 0
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { getBySlug } = useProductCatalog();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // The server renders an empty cart, so stored items can only be read after
  // mount. Deferring the read a frame keeps the state update out of the effect
  // body, which would otherwise cascade a second render pass.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setItems(JSON.parse(stored) as CartItem[]);
      } catch {
        /* ignore corrupt storage */
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (product: Product, weightGrams: WeightGrams, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) =>
            i.productSlug === product.slug && i.weightGrams === weightGrams
        );
        if (existing) {
          return prev.map((i) =>
            i.productSlug === product.slug && i.weightGrams === weightGrams
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [
          ...prev,
          { productSlug: product.slug, weightGrams, quantity },
        ];
      });
      setIsOpen(true);
    },
    []
  );

  const addPromo = useCallback((promo: Promo, quantity = 1) => {
    setItems((prev) => {
      const next = [...prev];
      for (const required of promo.items) {
        const add = required.quantity * quantity;
        const index = next.findIndex(
          (i) =>
            i.productSlug === required.slug &&
            i.weightGrams === required.weightGrams
        );
        if (index >= 0) {
          next[index] = { ...next[index], quantity: next[index].quantity + add };
        } else {
          next.push({
            productSlug: required.slug,
            weightGrams: required.weightGrams,
            quantity: add,
          });
        }
      }
      return next;
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback(
    (productSlug: string, weightGrams: number) => {
      setItems((prev) =>
        prev.filter(
          (i) =>
            !(i.productSlug === productSlug && i.weightGrams === weightGrams)
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productSlug: string, weightGrams: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productSlug, weightGrams);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productSlug === productSlug && i.weightGrams === weightGrams
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  // Bundle offers are matched against cart contents, so the subtotal has to go
  // through the same pricing function the orders API uses.
  const pricing = useMemo(
    () =>
      priceCart(
        getBySlug,
        items.map((i) => ({
          slug: i.productSlug,
          weightGrams: i.weightGrams,
          quantity: i.quantity,
        }))
      ),
    [items, getBySlug]
  );

  const subtotal = pricing.subtotalMAD;

  const value = useMemo(
    () => ({
      items,
      addItem,
      addPromo,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      pricing,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [
      items,
      addItem,
      addPromo,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      pricing,
      isOpen,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export { getItemPrice };
