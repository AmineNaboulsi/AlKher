import Image from "next/image";
import Link from "next/link";
import { plates } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { BrassRule } from "@/components/khatem";
import { SHOW_CATALOG } from "@/lib/site-config";

/**
 * The closing band: one photograph, one sentence, one button.
 *
 * The plate is already scrimmed edge to edge (`scrim: "full"` in the media
 * plan), so nothing here needs a second overlay fighting the grade.
 */
export function CtaBand() {
  return (
    // Dark in both themes — the plate behind it is a dark photograph.
    <section data-theme="dark" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src={plates.ctaBand}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-night/45" />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 px-4 py-24 text-center sm:px-6 sm:py-32">
        <BrassRule className="w-40" />

        <h2 className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl">
          دير البراد على النار،
          <br />
          <span className="brass-text">وخلّي الباقي علينا</span>
        </h2>

        <p className="max-w-xl leading-relaxed text-ink-muted text-pretty">
          اطلب علبتك اليوم — التوصيل لجميع المدن المغربية، والخلاص عند التوصيل.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {SHOW_CATALOG && (
            <Button asChild variant="brass" size="xl">
              <Link href="/shop">تسوق الآن</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="xl">
            <Link href="/#contact">تواصل معنا</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
