"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { ProductDocument } from "@/lib/products-repo";
import type { AdLandingCopy } from "@/lib/ad-landing-copy";
import { isVariantInStock, type WeightGrams } from "@/lib/products";
import { deliveryFee } from "@/lib/checkout-config";
import type { CreateOrderError, CreateOrderSuccess } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Price } from "@/components/price";
import { Footer } from "@/components/footer";
import { ZelligeDivider } from "@/components/zellige-divider";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useSiteSettings } from "@/components/site-settings-provider";
import { cn } from "@/lib/utils";

type Placed = CreateOrderSuccess & { customerName: string; city: string };

type AdLandingPageProps = {
  product: ProductDocument;
  copy: AdLandingCopy;
};

export function AdLandingPage({ product, copy }: AdLandingPageProps) {
  const { contactPhone } = useSiteSettings();
  const [selectedWeight, setSelectedWeight] = useState<WeightGrams>(
    (product.variants.find(isVariantInStock) ?? product.variants[0])
      .weightGrams
  );
  const [quantity, setQuantity] = useState(1);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    NonNullable<CreateOrderError["fields"]>
  >({});
  const [placed, setPlaced] = useState<Placed | null>(null);

  const selectedVariant = product.variants.find(
    (v) => v.weightGrams === selectedWeight
  );
  const unitPrice = selectedVariant?.priceMAD ?? 0;
  const canOrder =
    product.inStock && selectedVariant != null && isVariantInStock(selectedVariant);

  const deliveryFeeMAD = deliveryFee();
  const subtotal = unitPrice * quantity;
  const total = subtotal + deliveryFeeMAD;

  const whatsappHref = useMemo(() => {
    const digits = contactPhone.replace(/\D/g, "");
    const text = encodeURIComponent(`مرحباً، عندي سؤال على ${product.name}`);
    return `https://wa.me/${digits}?text=${text}`;
  }, [contactPhone, product.name]);

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
          items: [{ slug: product.slug, weightGrams: selectedWeight, quantity }],
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
      setPlaced({ ...success, customerName: fullName.trim(), city });
    } catch {
      setFormError("تعذّر الاتصال بالخادم. تحقّق من الإنترنت وحاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="pt-16 pb-12">
        {/* Announcement bar — sits right below the fixed site header, not on top of it */}
        <div className="bg-brass text-background text-center text-xs sm:text-sm font-medium py-2 px-4">
          🚚 توصيل لجميع المدن · 💵 الدفع نقداً عند الاستلام
        </div>

        {/* Hero */}
        <div className="warm-wash border-b brass-hairline">
          <div className="mx-auto max-w-xl px-4 sm:px-6 pt-8 pb-6 text-center">
            <div className="relative mx-auto aspect-square max-w-sm">
              <Image
                src={copy.heroImage}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 24rem, 90vw"
                className="object-contain"
                priority
              />
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold mt-4 text-balance">
              {copy.headline}
            </h1>
            <p className="text-ink-muted mt-2 leading-relaxed">
              {copy.subheadline}
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mx-auto max-w-xl px-4 sm:px-6 mt-6">
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-ink-muted">
            <div className="flex flex-col items-center gap-1.5 rounded-lg border brass-hairline bg-surface py-3">
              <Truck className="h-5 w-5 text-brass" />
              توصيل لكل المدن
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-lg border brass-hairline bg-surface py-3">
              <Banknote className="h-5 w-5 text-brass" />
              الدفع عند الاستلام
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-lg border brass-hairline bg-surface py-3">
              <ShieldCheck className="h-5 w-5 text-brass" />
              منتج أصلي 100%
            </div>
          </div>
        </div>

        {/* Order panel */}
        <div className="mx-auto max-w-xl px-4 sm:px-6 mt-8">
          {placed ? (
            <div className="rounded-lg border brass-hairline bg-surface p-8 space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/10 text-mint">
                <BadgeCheck className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold">
                  تم تسجيل طلبك، {placed.customerName}
                </h2>
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
              <div className="flex justify-between border-t brass-hairline pt-4 font-semibold max-w-xs mx-auto">
                <span>المبلغ المطلوب عند الاستلام</span>
                <Price amount={placed.totalMAD} className="text-brass" />
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-lg border brass-hairline bg-surface p-5 sm:p-6 space-y-5 text-start"
              noValidate
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold">
                  {product.name}
                </h2>
                {product.inStock ? (
                  <span className="text-xs rounded-full bg-mint/10 text-mint px-2.5 py-0.5">
                    متوفر
                  </span>
                ) : (
                  <span className="text-xs rounded-full bg-surface-raised text-ink-muted px-2.5 py-0.5">
                    نفد المخزون
                  </span>
                )}
              </div>

              {/* Weight selector */}
              {product.variants.length > 1 && (
                <div>
                  <p className="text-sm font-medium mb-2">الوزن</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const available = isVariantInStock(v);
                      return (
                        <button
                          key={v.weightGrams}
                          type="button"
                          disabled={!available}
                          onClick={() => setSelectedWeight(v.weightGrams)}
                          className={cn(
                            "rounded-md border px-4 py-2 text-sm transition-colors",
                            !available
                              ? "border-border text-ink-muted/50 line-through cursor-not-allowed"
                              : selectedWeight === v.weightGrams
                                ? "border-brass bg-brass/10 text-brass"
                                : "border-border text-ink-muted hover:border-brass/50"
                          )}
                        >
                          <span dir="ltr">
                            {v.weightGrams >= 1000
                              ? `${v.weightGrams / 1000}kg`
                              : `${v.weightGrams}g`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">الكمية</p>
                <div className="inline-flex items-center border brass-hairline rounded-md">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-surface-raised transition-colors"
                    aria-label="تقليل"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center" dir="ltr">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-surface-raised transition-colors"
                    aria-label="زيادة"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between border-t brass-hairline pt-4">
                <span className="text-sm text-ink-muted">السعر</span>
                <Price amount={subtotal} className="text-2xl font-bold text-brass" />
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
                    required
                  />
                  {fieldErrors.fullName && (
                    <p className="text-xs text-clay">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="city" className="block text-sm font-medium">
                    المدينة
                  </label>
                  <Input
                    id="city"
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    autoComplete="address-level2"
                    placeholder="مثال: مراكش"
                    aria-invalid={Boolean(fieldErrors.city)}
                    required
                  />
                  {fieldErrors.city && (
                    <p className="text-xs text-clay">{fieldErrors.city}</p>
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
                    required
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-clay">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="brass"
                size="lg"
                className="w-full"
                disabled={submitting || !canOrder}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {!canOrder
                  ? "غير متوفر حالياً"
                  : submitting
                    ? "جارٍ التسجيل…"
                    : `اطلب الآن — ${total} د.م.`}
              </Button>
            </form>
          )}
        </div>

        <ZelligeDivider variant="compact" />

        {/* Description + bullets */}
        <div className="mx-auto max-w-xl px-4 sm:px-6 space-y-6 text-start">
          <h2 className="font-display text-xl font-semibold">الوصف</h2>
          <p className="text-ink-muted leading-relaxed">{product.description}</p>

          <ul className="space-y-3">
            {copy.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-mint mt-0.5" />
                <span className="text-ink-muted">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <ZelligeDivider variant="compact" />

        {/* COD "guarantee" band */}
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <div className="rounded-lg bg-ink text-background p-6 sm:p-8 text-center space-y-3">
            <h2 className="font-display text-xl sm:text-2xl font-bold">
              ما تدفعش حتى توصلك السلعة
            </h2>
            <p className="text-background/70 leading-relaxed">
              تؤكّد الطلب الآن، ونتواصل معك هاتفياً لتأكيد التفاصيل، ثم نوصّل
              طلبك إلى باب المنزل — وتدفع نقداً فقط عند الاستلام بعد التأكد من
              المنتج. بدون مخاطرة، بدون دفع مسبق.
            </p>
          </div>
        </div>
      </div>

      <Footer />

      {/* Floating WhatsApp contact */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا على واتساب"
        className="fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-mint text-background shadow-card hover:bg-mint-deep transition-colors"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </>
  );
}
