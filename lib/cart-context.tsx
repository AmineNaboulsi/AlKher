"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { products, type Product, type WeightGrams } from "./products";

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
  removeItem: (productSlug: string, weightGrams: number) => void;
  updateQuantity: (
    productSlug: string,
    weightGrams: number,
    quantity: number
  ) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
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

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.slug === item.productSlug);
      if (!product) return sum;
      return sum + getItemPrice(product, item.weightGrams) * item.quantity;
    }, 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
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
