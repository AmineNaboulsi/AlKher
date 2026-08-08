import Link from "next/link";
import { ChevronDown, Truck, ShieldCheck, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Khatem } from "@/components/khatem";
import { SHOW_CATALOG } from "@/lib/site-config";
import { HeroVideo } from "./hero-video";

const facts = [
  { label: "أرخص عبوة", value: "20 د.م.", ltr: true },
  { label: "الأنواع", value: "4", ltr: false },
  { label: "التوصيل", value: "كل المدن", ltr: false },
];

const trust = [
  { icon: Truck, label: "التوصيل لجميع المدن المغربية" },
  { icon: ShieldCheck, label: "الدفع عند التوصيل" },
  { icon: BadgePercent, label: "أثمنة المحل، بلا زيادة" },
];

export function HeroSection() {
  return (
    // Pinned to the dark palette in both themes: the ground here is a dark
    // video, so cream-on-black is the only legible reading of it. The rule
    // holds everywhere in this design — a block backed by a dark photograph
    // carries `data-theme="dark"`, whatever the page around it is doing.
    <section
      data-theme="dark"
      className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden bg-night"
    >
      <HeroVideo />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-32 sm:px-6 lg:px-8 lg:pb-20">
        <div className="max-w-2xl space-y-7">
          <p className="animate-fade-rise flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-brass">
            <Khatem className="h-3.5 w-3.5" strokeWidth={8} />
            شاي أخضر صيني — أساس الأتاي المغربي
          </p>

          <h1
            className="animate-fade-rise font-display text-[clamp(2.5rem,7vw,4.75rem)] font-bold leading-[1.15] text-balance"
            style={{ animationDelay: "80ms" }}
          >
            الشاي عندنا مش مشروب…
            <br />
            <span className="brass-text">هو ترحيب</span>
          </h1>

          <p
            className="animate-fade-rise max-w-xl text-lg leading-relaxed text-ink-muted text-pretty"
            style={{ animationDelay: "160ms" }}
          >
            أشهر علب الشاي الأخضر فالمغرب — لاس بالماس، الساقية الحمراء، سمارة،
            وبيت الفخامة. بأثمنة المحل، وبنفس الطعم اللي كيعرفه البراد.
          </p>

          <div
            className="animate-fade-rise flex flex-wrap items-center gap-3 pt-1"
            style={{ animationDelay: "240ms" }}
          >
            {SHOW_CATALOG && (
              <Button asChild variant="brass" size="xl">
                <Link href="/shop">تسوق الآن</Link>
              </Button>
            )}
            <Button
              asChild
              variant={SHOW_CATALOG ? "outline" : "brass"}
              size="xl"
            >
              <Link href="/#ritual">شوف طريقة الأتاي</Link>
            </Button>
          </div>

          {SHOW_CATALOG ? (
            <dl
              className="animate-fade-rise flex flex-wrap gap-x-10 gap-y-4 pt-4"
              style={{ animationDelay: "320ms" }}
            >
              {facts.map((fact) => (
                <div key={fact.label} className="space-y-0.5">
                  <dt className="text-xs uppercase tracking-widest text-ink-faint">
                    {fact.label}
                  </dt>
                  <dd
                    className="font-display text-xl font-semibold text-brass-light"
                    dir={fact.ltr ? "ltr" : undefined}
                  >
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm font-medium text-brass">
              المتجر الإلكتروني كيفتح قريباً — تواصل معنا للطلب حالياً.
            </p>
          )}
        </div>
      </div>

      {/* Trust strip, welded to the bottom of the hero so the first scroll
          lands on a reason to buy rather than on empty page. */}
      <div className="relative z-10 border-t brass-hairline glass">
        <ul className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          {trust.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 shrink-0 text-brass" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/#collections"
        aria-label="تصفّح الأنواع"
        className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 animate-bounce text-brass/60 transition-colors hover:text-brass lg:block"
      >
        <ChevronDown className="h-6 w-6" />
      </Link>
    </section>
  );
}
