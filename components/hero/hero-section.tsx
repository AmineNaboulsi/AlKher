import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroVideo } from "./hero-video";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden warm-wash">
      {/* Soft brass bloom, top-start corner */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(138,100,32,0.07),transparent_55%)]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:pt-36 lg:pb-24">
        <div className="flex flex-col justify-center space-y-6 text-start">
          <p className="text-sm font-medium uppercase tracking-widest text-brass">
            شاي أخضر صيني — أساس الأتاي المغربي
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-balance sm:text-5xl lg:text-6xl">
            الشاي عندنا
            <br />
            <span className="text-majorelle">مش مشروب… هو ترحيب</span>
          </h1>
          <p className="max-w-lg text-lg text-ink-muted leading-relaxed">
            نوفّر أشهر علب الشاي الأخضر في المغرب — لاس بالماس، الساقية
            الحمراء، سمارة، وبيت الفخامة — بأسعار المحل، وبنفس الطعم الذي
            يعرفه البراد المغربي.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button asChild variant="brass" size="lg">
              <Link href="/shop">تسوق الآن</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/#story">اكتشف قصتنا</Link>
            </Button>
          </div>

          <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-4 text-sm">
            <div>
              <dt className="text-ink-muted">أرخص عبوة</dt>
              <dd className="font-display text-lg font-semibold text-brass">
                <span dir="ltr">20 د.م.</span>
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">أكبر عبوة</dt>
              <dd className="font-display text-lg font-semibold text-brass">
                <span dir="ltr">500g</span>
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">الأنواع</dt>
              <dd className="font-display text-lg font-semibold text-brass">
                4
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <HeroVideo />
        </div>
      </div>
    </section>
  );
}
