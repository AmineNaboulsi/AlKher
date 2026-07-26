"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Banknote, Loader2, Truck } from "lucide-react";
import { useCart, getItemPrice } from "@/lib/cart-context";
import { products } from "@/lib/products";
import type {
  CreateOrderError,
  CreateOrderSuccess,
  OrderLine,
} from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";

type CheckoutConfig = {
  cities: { name: string; deliveryFeeMAD: number }[];
  defaultCity: string;
  freeDeliveryThresholdMAD: number;
  paymentMethod: { id: string; label: string; note: string };
};

type Placed = CreateOrderSuccess & {
  customerName: string;
  city: string;
  lines: OrderLine[];
};

export function CheckoutForm() {
  const { items, subtotal, pricing, clearCart } = useCart();

  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [configFailed, setConfigFailed] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    NonNullable<CreateOrderError["fields"]>
  >({});
  const [placed, setPlaced] = useState<Placed | null>(null);

  // Predefined cities and delivery rates come from the backend.
  useEffect(() => {
    let active = true;

    fetch("/api/checkout/config")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<CheckoutConfig>;
      })
      .then((data) => {
        if (!active) return;
        setConfig(data);
        setCity((current) => current || data.defaultCity);
      })
      .catch(() => {
        if (active) setConfigFailed(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedCity = config?.cities.find((c) => c.name === city);
  const freeDelivery =
    config != null && subtotal >= config.freeDeliveryThresholdMAD;
  const deliveryFee = freeDelivery ? 0 : selectedCity?.deliveryFeeMAD ?? 0;
  const total = subtotal + deliveryFee;

  const lines = useMemo(
    () =>
      items.flatMap((item) => {
        const product = products.find((p) => p.slug === item.productSlug);
        if (!product) return [];
        const unitPrice = getItemPrice(product, item.weightGrams);
        return [
          {
            product,
            weightGrams: item.weightGrams,
            quantity: item.quantity,
            unitPrice,
            lineTotal: unitPrice * item.quantity,
          },
        ];
      }),
    [items]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          city,
          items: items.map((i) => ({
            slug: i.productSlug,
            weightGrams: i.weightGrams,
            quantity: i.quantity,
          })),
        }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const err = data as CreateOrderError;
        setFormError(err.error ?? "تعذّر تسجيل الطلب.");
        setFieldErrors(err.fields ?? {});
        return;
      }

      const success = data as CreateOrderSuccess;
      setPlaced({
        ...success,
        customerName: fullName.trim(),
        city,
        lines: lines.map((l) => ({
          slug: l.product.slug,
          name: l.product.name,
          weightGrams: l.weightGrams,
          quantity: l.quantity,
          unitPriceMAD: l.unitPrice,
          lineTotalMAD: l.lineTotal,
        })),
      });
      clearCart();
    } catch {
      setFormError("تعذّر الاتصال بالخادم. تحقّق من الإنترنت وحاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  // --- Order placed ---
  if (placed) {
    return (
      <div className="rounded-lg border brass-hairline bg-surface p-8 sm:p-10 space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/10 text-mint">
          <BadgeCheck className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold">
            تم تسجيل طلبك، {placed.customerName}
          </h1>
          <p className="text-ink-muted">
            رقم الطلب:{" "}
            <span className="font-semibold text-brass" dir="ltr">
              {placed.orderNumber}
            </span>
          </p>
        </div>

        <p className="text-ink-muted leading-relaxed">
          سنتصل بك على الرقم الذي أدخلته لتأكيد الطلب قبل الإرسال إلى{" "}
          {placed.city}. الدفع نقداً عند الاستلام.
        </p>

        <dl className="mx-auto max-w-xs space-y-2 text-sm text-start">
          {placed.appliedPromos.map((promo) => (
            <div key={promo.promoId} className="flex justify-between gap-2">
              <dt className="text-clay text-xs">
                عرض: {promo.name}
                {promo.times > 1 && <span dir="ltr"> ×{promo.times}</span>}
              </dt>
              <dd>
                <Price amount={promo.totalMAD} className="text-clay text-xs" />
              </dd>
            </div>
          ))}
          {placed.discountMAD > 0 && (
            <div className="flex justify-between">
              <dt className="text-clay">وفّرت</dt>
              <dd>
                <Price amount={placed.discountMAD} className="text-clay" />
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-muted">المجموع الفرعي</dt>
            <dd>
              <Price amount={placed.subtotalMAD} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">التوصيل</dt>
            <dd>
              {placed.deliveryFeeMAD === 0 ? (
                <span className="text-mint">مجاني</span>
              ) : (
                <Price amount={placed.deliveryFeeMAD} />
              )}
            </dd>
          </div>
          <div className="flex justify-between border-t brass-hairline pt-2 font-semibold">
            <dt>المبلغ المطلوب عند الاستلام</dt>
            <dd>
              <Price amount={placed.totalMAD} className="text-brass" />
            </dd>
          </div>
        </dl>

        <Button asChild variant="brass">
          <Link href="/shop">مواصلة التسوق</Link>
        </Button>
      </div>
    );
  }

  // --- Empty cart ---
  if (items.length === 0) {
    return (
      <div className="rounded-lg border brass-hairline bg-surface p-8 sm:p-12 space-y-6 text-center">
        <h1 className="font-display text-2xl font-bold">السلة فارغة</h1>
        <p className="text-ink-muted">
          أضف منتجاً واحداً على الأقل قبل إتمام الطلب.
        </p>
        <Button asChild variant="brass">
          <Link href="/shop">تصفّح المتجر</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form onSubmit={handleSubmit} className="space-y-6 text-start" noValidate>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            إتمام الطلب
          </h1>
          <p className="text-ink-muted text-sm">
            نحتاج فقط اسمك، مدينتك، ورقم هاتفك.
          </p>
        </div>

        {/* Payment method — cash on delivery only */}
        <div className="rounded-lg border brass-hairline bg-surface p-4 flex gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/10 text-brass">
            <Banknote className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <p className="font-medium">
              {config?.paymentMethod.label ?? "الدفع عند الاستلام"}
            </p>
            <p className="text-sm text-ink-muted">
              {config?.paymentMethod.note ??
                "تدفع نقداً لموصّل الطلب عند التسليم."}
            </p>
          </div>
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-md border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay"
          >
            {formError}
          </p>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="block text-sm font-medium">
              الاسم الكامل
            </label>
            <Input
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              placeholder="مثال: محمد العلوي"
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={
                fieldErrors.fullName ? "fullName-error" : undefined
              }
              required
            />
            {fieldErrors.fullName && (
              <p id="fullName-error" className="text-xs text-clay">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="city" className="block text-sm font-medium">
              المدينة
            </label>
            <select
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!config}
              aria-invalid={Boolean(fieldErrors.city)}
              aria-describedby={fieldErrors.city ? "city-error" : undefined}
              className={cn(
                "flex h-10 w-full rounded-md border brass-hairline bg-surface px-3 py-2 text-sm text-ink",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              required
            >
              {!config && <option value="">جارٍ تحميل المدن…</option>}
              {config?.cities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {configFailed && (
              <p className="text-xs text-clay">
                تعذّر تحميل قائمة المدن — أعِد تحميل الصفحة.
              </p>
            )}
            {fieldErrors.city && (
              <p id="city-error" className="text-xs text-clay">
                {fieldErrors.city}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-medium">
              رقم الهاتف
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="0612345678"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
              required
            />
            {fieldErrors.phone ? (
              <p id="phone-error" className="text-xs text-clay">
                {fieldErrors.phone}
              </p>
            ) : (
              <p className="text-xs text-ink-muted">
                سنتصل بك على هذا الرقم لتأكيد الطلب.
              </p>
            )}
          </div>
        </div>

        {fieldErrors.items && (
          <p role="alert" className="text-sm text-clay">
            {fieldErrors.items}
          </p>
        )}

        <Button
          type="submit"
          variant="brass"
          size="lg"
          className="w-full sm:w-auto"
          disabled={submitting || !config}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "جارٍ التسجيل…" : "تأكيد الطلب — الدفع عند الاستلام"}
        </Button>
      </form>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 h-fit rounded-lg border brass-hairline bg-surface p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold">ملخّص الطلب</h2>

        <ul className="space-y-3">
          {lines.map((line) => (
            <li
              key={`${line.product.slug}-${line.weightGrams}`}
              className="flex gap-3"
            >
              <ProductImage
                product={line.product}
                className="h-14 w-14 shrink-0 rounded-md"
                sizes="56px"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {line.product.name}
                </p>
                <p className="text-xs text-ink-muted" dir="ltr">
                  {line.weightGrams}g × {line.quantity}
                </p>
              </div>
              <Price
                amount={line.lineTotal}
                className="text-sm font-semibold shrink-0"
              />
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t brass-hairline pt-4 text-sm">
          {pricing.appliedPromos.map((promo) => (
            <div key={promo.promoId} className="flex justify-between gap-2">
              <dt className="text-clay text-xs">
                عرض: {promo.name}
                {promo.times > 1 && <span dir="ltr"> ×{promo.times}</span>}
              </dt>
              <dd>
                <Price amount={promo.totalMAD} className="text-clay text-xs" />
              </dd>
            </div>
          ))}
          {pricing.discountMAD > 0 && (
            <div className="flex justify-between">
              <dt className="text-clay">وفّرت</dt>
              <dd>
                <Price amount={pricing.discountMAD} className="text-clay" />
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-muted">المجموع الفرعي</dt>
            <dd>
              <Price amount={subtotal} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">التوصيل {city && `— ${city}`}</dt>
            <dd>
              {!config ? (
                <span className="text-ink-muted text-xs">…</span>
              ) : deliveryFee === 0 ? (
                <span className="text-mint">مجاني</span>
              ) : (
                <Price amount={deliveryFee} />
              )}
            </dd>
          </div>
          <div className="flex justify-between border-t brass-hairline pt-2 font-semibold">
            <dt>الإجمالي</dt>
            <dd>
              <Price amount={total} className="text-brass text-base" />
            </dd>
          </div>
        </dl>

        {config && !freeDelivery && (
          <p className="flex items-start gap-2 text-xs text-ink-muted">
            <Truck className="h-4 w-4 shrink-0 mt-px" />
            التوصيل مجاني للطلبات من{" "}
            <span dir="ltr">{config.freeDeliveryThresholdMAD} د.م.</span> فما
            فوق.
          </p>
        )}
      </aside>
    </div>
  );
}
