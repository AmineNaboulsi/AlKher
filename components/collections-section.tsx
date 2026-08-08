import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { collections } from "@/lib/media";
import { SectionHeading } from "@/components/section-heading";

/**
 * The three grades, as a customer would actually choose between them.
 *
 * Each card is a rendered plate under a riad arch — the crop, grade and
 * bottom scrim are baked into the image by the Remotion studio, so the title
 * sitting on it stays live HTML and stays legible without a second overlay.
 */
export function CollectionsSection() {
  return (
    <section id="collections" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="الأنواع"
          title="ثلاث درجات، وثلاث أذواق"
          blurb="الفرق ماشي فالثمن وحدو — الفرق فالفرز، وفقوّة الورقة، وفالمرارة اللي كتبقى فالكأس."
          align="center"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {collections.map((collection, index) => (
            <Link
              key={collection.category}
              href={`/shop?category=${encodeURIComponent(collection.category)}`}
              // The caption sits on the scrimmed plate, so the card keeps the
              // dark palette even when the section around it is light.
              data-theme="dark"
              className="group relative block overflow-hidden rounded-2xl border brass-hairline transition-colors duration-300 hover:border-brass/50"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={collection.plate}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                  priority={index === 0}
                />
                <div className="absolute inset-0 scrim-bottom" />
              </div>

              <div className="absolute inset-x-0 bottom-0 space-y-2 p-6">
                <h3 className="font-display text-2xl font-bold">
                  {collection.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {collection.blurb}
                </p>
                <span className="inline-flex items-center gap-2 pt-1 text-sm font-medium text-brass transition-colors group-hover:text-brass-light">
                  تصفّح
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
