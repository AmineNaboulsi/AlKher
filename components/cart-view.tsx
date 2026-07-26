"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ChevronRight } from "lucide-react";
import { useCart, getItemPrice } from "@/lib/cart-context";
import { products } from "@/lib/products";
import { ProductImage } from "@/components/product-image";
import { Price } from "@/components/price";
import { Button } from "@/components/ui/button";

export function CartView() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();

  return (
    <div className="pt-24 pb-12 sm:pt-28 min-h-[60vh]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-6">
          <Link href="/" className="hover:text-ink transition-colors">
            الرئيسية
          </Link>
          <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
          <span className="text-ink">السلة</span>
        </nav>

        <h1 className="font-display text-3xl font-bold mb-8">سلة التسوق</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-ink-muted text-lg">سلتك فارغة حالياً</p>
            <Button asChild variant="brass">
              <Link href="/shop">تصفّح المتجر</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <ul className="space-y-4">
              {items.map((item) => {
                const product = products.find(
                  (p) => p.slug === item.productSlug
                );
                if (!product) return null;
                const price = getItemPrice(product, item.weightGrams);

                return (
                  <li
                    key={`${item.productSlug}-${item.weightGrams}`}
                    className="flex gap-4 rounded-lg border brass-hairline bg-surface p-4"
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      className="shrink-0"
                    >
                      <ProductImage
                        product={product}
                        className="h-20 w-20 rounded-md"
                        sizes="80px"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col gap-3 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-medium hover:text-brass transition-colors"
                          >
                            {product.name}
                          </Link>
                          <p className="text-sm text-ink-muted">
                            <span dir="ltr">{item.weightGrams}g</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.productSlug, item.weightGrams)
                          }
                          className="text-ink-muted hover:text-clay transition-colors"
                          aria-label="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border brass-hairline rounded-md">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productSlug,
                                item.weightGrams,
                                item.quantity - 1
                              )
                            }
                            className="p-2 hover:bg-surface-raised transition-colors"
                            aria-label="تقليل"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center" dir="ltr">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productSlug,
                                item.weightGrams,
                                item.quantity + 1
                              )
                            }
                            className="p-2 hover:bg-surface-raised transition-colors"
                            aria-label="زيادة"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <Price
                          amount={price * item.quantity}
                          className="font-semibold text-brass"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="rounded-lg border brass-hairline bg-surface p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">المجموع الفرعي</span>
                <Price amount={subtotal} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">الشحن</span>
                <span className="text-ink-muted text-xs">يُحسب عند الدفع</span>
              </div>
              <div className="border-t brass-hairline pt-4 flex justify-between font-semibold">
                <span>الإجمالي</span>
                <Price amount={subtotal} className="text-brass text-lg" />
              </div>
              <Button asChild variant="brass" size="lg" className="w-full">
                <Link href="/checkout">المتابعة إلى الدفع</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-ink-muted"
                onClick={clearCart}
              >
                إفراغ السلة
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
