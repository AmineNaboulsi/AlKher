"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, getItemPrice } from "@/lib/cart-context";
import { useProductCatalog } from "@/components/product-catalog-provider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    pricing,
    itemCount,
  } = useCart();
  const { getBySlug } = useProductCatalog();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>سلة التسوق ({itemCount})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center py-12">
            <p className="text-ink-muted">سلتك فارغة حالياً</p>
            <Button asChild variant="brass" onClick={closeCart}>
              <Link href="/shop">تصفّح المتجر</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto space-y-4 -mx-2 px-2">
              {items.map((item) => {
                const product = getBySlug(item.productSlug);
                if (!product) return null;
                const price = getItemPrice(product, item.weightGrams);

                return (
                  <li
                    key={`${item.productSlug}-${item.weightGrams}`}
                    className="flex gap-3 rounded-lg border brass-hairline bg-surface-raised p-3"
                  >
                    <ProductImage
                      product={product}
                      className="h-16 w-16 shrink-0 rounded-md"
                      sizes="64px"
                    />
                    <div className="flex flex-1 flex-col gap-2 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-ink-muted">
                            <span dir="ltr">{item.weightGrams}g</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.productSlug, item.weightGrams)
                          }
                          className="text-ink-muted hover:text-clay transition-colors shrink-0"
                          aria-label="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 border brass-hairline rounded-md">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productSlug,
                                item.weightGrams,
                                item.quantity - 1
                              )
                            }
                            className="p-1.5 hover:bg-surface transition-colors"
                            aria-label="تقليل الكمية"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm" dir="ltr">
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
                            className="p-1.5 hover:bg-surface transition-colors"
                            aria-label="زيادة الكمية"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <Price
                          amount={price * item.quantity}
                          className="text-sm font-semibold text-brass"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t brass-hairline pt-4 space-y-3">
              {pricing.appliedPromos.map((promo) => (
                <div
                  key={promo.promoId}
                  className="flex justify-between gap-2 text-xs text-clay"
                >
                  <span>
                    عرض: {promo.name}
                    {promo.times > 1 && <span dir="ltr"> ×{promo.times}</span>}
                  </span>
                  <Price amount={promo.totalMAD} />
                </div>
              ))}
              {pricing.discountMAD > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-clay">وفّرت</span>
                  <Price amount={pricing.discountMAD} className="text-clay" />
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">المجموع الفرعي</span>
                <Price amount={subtotal} className="font-semibold" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">الشحن</span>
                <span className="text-ink-muted text-xs">يُحسب عند الدفع</span>
              </div>
              <Button asChild variant="brass" className="w-full" size="lg">
                <Link href="/cart" onClick={closeCart}>
                  عرض السلة والمتابعة
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
