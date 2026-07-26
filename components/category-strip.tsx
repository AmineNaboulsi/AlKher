import Link from "next/link";
import { CATEGORIES } from "@/lib/products";
import { Leaf, Sprout, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryMeta: Record<
  (typeof CATEGORIES)[number],
  { icon: React.ReactNode; gradient: string; blurb: string }
> = {
  شنمي: {
    icon: <Sprout className="h-5 w-5" />,
    gradient: "from-mint/10 to-transparent",
    blurb: "الدرجة 41022 — أساس الأتاي المغربي",
  },
  "أخضر فاخر": {
    icon: <Sparkles className="h-5 w-5" />,
    gradient: "from-brass/10 to-transparent",
    blurb: "فرز أدقّ للمناسبات والضيافة",
  },
  "أخضر صيني": {
    icon: <Leaf className="h-5 w-5" />,
    gradient: "from-majorelle/10 to-transparent",
    blurb: "خيار يومي بسعر معقول",
  },
};

export function CategoryStrip() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold mb-8 text-start">
          تصفّح حسب النوع
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const meta = categoryMeta[cat];
            return (
              <Link
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className={cn(
                  "group flex flex-col items-start gap-3 rounded-lg border brass-hairline bg-surface p-5 text-start transition-all hover:border-brass/50 hover:shadow-card",
                  "bg-gradient-to-br",
                  meta.gradient
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-brass border brass-hairline group-hover:text-brass-light transition-colors">
                  {meta.icon}
                </span>
                <span className="font-display text-base font-semibold">
                  {cat}
                </span>
                <span className="text-sm text-ink-muted">{meta.blurb}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
