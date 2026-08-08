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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Price } from "@/components/price";
import { Footer } from "@/components/footer";
import { BrassRule, Khatem, SectionKicker } from "@/components/khatem";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useSiteSettings } from "@/components/site-settings-provider";
import { plates, productClip, ritual } from "@/lib/media";
import { cn } from "@/lib/utils";

type Placed = CreateOrderSuccess & { customerName: string; city: string };

type AdLandingPageProps = {
  product: ProductDocument;
  copy: AdLandingCopy;
};

const badges = [
  { icon: Truck, label: "توصيل لكل المدن" },
  { icon: Banknote, label: "الخلاص عند التوصيل" },
  { icon: ShieldCheck, label: "منتج أصلي 100%" },
];

/** The four questions that actually stop a cash-on-delivery order in Morocco. */
const faq = [
  {
    q: "شحال كيدوز باش يوصلني الطلب؟",
    a: "كنتصلو بيك فنفس النهار باش نأكدو الطلب، والتوصيل عادةً كيدوز ما بين 24 و 72 ساعة حسب المدينة.",
  },
  {
    q: "واش خاصني نخلّص قبل؟",
    a: "لا. كتخلّص نقداً عند التوصيل، من بعد ما تشوف العلبة بعينيك.",
  },
  {
    q: "واش العلبة أصلية؟",
    a: "العلبة كما وصلات من المورّد، مغلّفة وما مفتوحاش — ما كنعبّيو حتى شي حاجة من جديد.",
  },
  {
    q: "واش نقدر نبدّل الطلب أو نزيد علب؟",
    a: "إيه. ملي كنتصلو بيك للتأكيد تقدر تبدّل الوزن أو تزيد علب أخرى قبل الإرسال.",
  },
];

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
    product.inStock &&
    selectedVariant != null &&
    isVariantInStock(selectedVariant);

  const deliveryFeeMAD = deliveryFee();
  const subtotal = unitPrice * quantity;
  const total = subtotal + deliveryFeeMAD;

  const clip = productClip(product.slug);

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
      {/* Sits directly under the fixed site header rather than over it. */}
      <div className="mt-18 bg-gradient-to-l from-brass-light to-brass px-4 py-2 text-center text-xs font-semibold text-night sm:text-sm">
        🚚 توصيل لجميع المدن · 💵 الخلاص عند التوصيل
      </div>

      {/* ------------------------------------------------------------ hero */}
      {/* Dark in both themes: the clip is the ground here, and it is dark. */}
      <section
        data-theme="dark"
        className="relative overflow-hidden border-b brass-hairline bg-night"
      >
        <div className="zellige-field pointer-events-none absolute inset-0" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
          {/* The rendered ad clip, in its native 9:16. Muted, looping and
              decorative — every claim it makes is repeated in the copy beside
              it, so a blocked autoplay costs nothing. */}
          <div className="mx-auto w-full max-w-sm lg:max-w-md">
            <div className="relative overflow-hidden rounded-3xl border brass-hairline-strong shadow-raised">
              {clip ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster={clip.poster}
                  aria-hidden="true"
                  className="aspect-9/16 w-full object-cover"
                >
                  <source src={clip.vertical} type="video/mp4" />
                </video>
              ) : (
                <div className="relative aspect-9/16 w-full bg-surface">
                  <Image
                    src={copy.heroImage}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 28rem, 90vw"
                    className="object-contain p-8"
                    priority
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 text-start">
            <SectionKicker>{product.category}</SectionKicker>

            <h1 className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl">
              {copy.headline}
            </h1>

            <p className="text-lg leading-relaxed text-ink-muted text-pretty">
              {copy.subheadline}
            </p>

            <ul className="space-y-3">
              {copy.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" />
                  <span className="leading-relaxed text-ink">{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button asChild variant="brass" size="xl">
                <a href="#order">اطلب الآن — {total} د.م.</a>
              </Button>
              <span className="text-sm text-ink-muted">
                الخلاص عند التوصيل
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- badges */}
      <div className="border-b brass-hairline bg-surface">
        <ul className="mx-auto grid max-w-4xl grid-cols-3 gap-px px-4 sm:px-6">
          {badges.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex flex-col items-center gap-2 py-5 text-center text-xs text-ink-muted sm:flex-row sm:justify-center sm:text-sm"
            >
              <Icon className="h-5 w-5 text-brass" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* ----------------------------------------------------------- order */}
      <section id="order" className="page-wash py-14 sm:py-20">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          {placed ? (
            <div className="space-y-6 rounded-3xl border brass-hairline bg-surface p-8 text-center shadow-card">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/15 text-mint ring-1 ring-inset ring-mint/30">
                <BadgeCheck className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold">
                  تسجّل الطلب ديالك، {placed.customerName}
                </h2>
                <p className="text-ink-muted">
                  رقم الطلب:{" "}
                  <span className="font-semibold text-brass" dir="ltr">
                    {placed.orderNumber}
                  </span>
                </p>
              </div>
              <p className="leading-relaxed text-ink-muted">
                غادي نتصلو بيك على الرقم اللي دخّلتي باش نأكدو الطلب قبل ما
                نصيفطوه لـ{placed.city}. الخلاص نقداً عند التوصيل.
              </p>
              <div className="mx-auto flex max-w-xs justify-between border-t brass-hairline pt-4 font-semibold">
                <span>المبلغ عند التوصيل</span>
                <Price amount={placed.totalMAD} className="text-brass-light" />
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-3xl border brass-hairline bg-surface p-6 text-start shadow-card sm:p-8"
              noValidate
            >
              <div className="space-y-1">
                <h2 className="flex items-center gap-2.5 font-display text-xl font-bold">
                  <Khatem className="h-4 w-4 text-brass" strokeWidth={8} />
                  عمّر المعلومات ديالك
                </h2>
                <p className="text-sm text-ink-muted">
                  {product.name} — كنتصلو بيك للتأكيد قبل الإرسال.
                </p>
              </div>

              {product.variants.length > 1 && (
                <div className="space-y-2.5">
                  <p className="text-sm font-medium">الوزن</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const available = isVariantInStock(v);
                      return (
                        <button
                          key={v.weightGrams}
                          type="button"
                          disabled={!available}
                          onClick={() => setSelectedWeight(v.weightGrams)}
                          aria-pressed={selectedWeight === v.weightGrams}
                          className={cn(
                            "rounded-full border px-5 py-2 text-sm transition-all",
                            !available
                              ? "cursor-not-allowed border-border text-ink-faint line-through"
                              : selectedWeight === v.weightGrams
                                ? "border-brass bg-brass/15 font-semibold text-brass-light"
                                : "border-border text-ink-muted hover:border-brass/50 hover:text-ink"
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

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">الكمية</p>
                <div className="inline-flex items-center rounded-full border brass-hairline bg-surface-raised">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded-full p-2.5 transition-colors hover:text-brass"
                    aria-label="تقليل"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span
                    className="w-10 text-center font-display font-semibold"
                    dir="ltr"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="rounded-full p-2.5 transition-colors hover:text-brass"
                    aria-label="زيادة"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <dl className="space-y-2 border-t brass-hairline pt-4 text-sm">
                <div className="flex justify-between text-ink-muted">
                  <dt>المنتج</dt>
                  <dd>
                    <Price amount={subtotal} />
                  </dd>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <dt>التوصيل</dt>
                  <dd>
                    {deliveryFeeMAD > 0 ? (
                      <Price amount={deliveryFeeMAD} />
                    ) : (
                      "مجاناً"
                    )}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-t brass-hairline pt-3">
                  <dt className="font-medium text-ink">المجموع</dt>
                  <dd>
                    <Price
                      amount={total}
                      className="font-display text-2xl font-bold text-brass-light"
                    />
                  </dd>
                </div>
              </dl>

              {formError && (
                <p
                  role="alert"
                  className="rounded-xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay"
                >
                  {formError}
                </p>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium"
                  >
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
                size="xl"
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

              <p className="text-center text-xs text-ink-faint">
                ما كتخلّص والو دابا — غير ملي توصلك العلبة.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------ description */}
      <section className="border-y brass-hairline bg-surface py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <figure className="relative aspect-4/3 overflow-hidden rounded-2xl border brass-hairline">
            <Image
              src={plates.quality}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </figure>

          <div className="space-y-5 text-start">
            <SectionKicker>على المنتج</SectionKicker>
            <h2 className="font-display text-2xl font-bold leading-tight text-balance sm:text-3xl">
              {product.name}
            </h2>
            <p className="leading-relaxed text-ink-muted text-pretty">
              {product.description}
            </p>
            <ul className="flex flex-wrap gap-2 pt-1">
              {product.flavorNotes.map((note) => (
                <li
                  key={note}
                  className="rounded-full border brass-hairline bg-surface-raised px-4 py-1.5 text-sm text-ink-muted"
                >
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- ritual */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <SectionKicker>طريقة التحضير</SectionKicker>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              باش يخرج ليك الطعم كامل
            </h2>
          </div>

          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {ritual.map((step) => (
              <li
                key={step.step}
                className="space-y-3 rounded-2xl border brass-hairline bg-surface p-6"
              >
                <span
                  className="font-display text-3xl font-bold text-brass/40"
                  dir="ltr"
                >
                  {step.step}
                </span>
                <h3 className="font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------- guarantee */}
      {/* Dark in both themes — the plate behind it is a dark photograph. */}
      <section data-theme="dark" className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={plates.ctaBand}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-night/55" />
        </div>

        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 py-20 text-center sm:px-6">
          <BrassRule className="w-32" />
          <h2 className="font-display text-2xl font-bold text-balance sm:text-3xl">
            ما تخلّصش حتى توصلك السلعة
          </h2>
          <p className="leading-relaxed text-ink-muted text-pretty">
            كتأكد الطلب دابا، كنتصلو بيك هاتفياً باش نأكدو التفاصيل، ومن بعد
            كنوصلو الطلب حتى لباب الدار — وكتخلّص نقداً غير ملي تشوف المنتج.
            بلا مخاطرة، وبلا خلاص مسبق.
          </p>
          <Button asChild variant="brass" size="xl" className="mt-2">
            <a href="#order">اطلب الآن</a>
          </Button>
        </div>
      </section>

      {/* ------------------------------------------------------------ faq */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <SectionKicker>أسئلة متكررة</SectionKicker>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              واش بقى شي سؤال؟
            </h2>
          </div>

          <Accordion type="single" collapsible className="border-t brass-hairline">
            {faq.map((item, index) => (
              <AccordionItem key={item.q} value={`faq-${index}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />

      {/* Sticky order bar — a paid visitor lands mid-page as often as at the
          top, and this keeps the price and the CTA one tap away. Hidden once
          the order is placed. */}
      {!placed && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t brass-hairline glass px-4 py-3 sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-ink-muted">{product.name}</p>
              <Price
                amount={total}
                className="font-display text-xl font-bold text-brass-light"
              />
            </div>
            <Button asChild variant="brass" size="lg">
              <a href="#order">اطلب الآن</a>
            </Button>
          </div>
        </div>
      )}

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا على واتساب"
        className="fixed bottom-24 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-mint text-night shadow-[0_10px_30px_rgba(63,203,147,0.3)] transition-colors hover:bg-mint-deep hover:text-ink sm:bottom-6"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </>
  );
}
