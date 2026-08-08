import Image from "next/image";
import { ritual } from "@/lib/media";
import { SectionHeading } from "@/components/section-heading";
import { Khatem } from "@/components/khatem";

/**
 * How the tea is actually made.
 *
 * This is the most-searched thing about Moroccan tea and the cheapest trust a
 * tea shop can buy: a shop that can tell you when to add the mint is a shop
 * that drinks its own product. It also gives the page a non-commercial beat
 * between the shelf and the story.
 */
export function RitualSection() {
  return (
    <section
      id="ritual"
      className="relative overflow-hidden border-y brass-hairline bg-surface py-20 sm:py-28"
    >
      <div className="zellige-field pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="طريقة الأتاي"
          title="ثلاث خطوات، وكأس كيتسمّى أتاي"
          blurb="نفس الخطوات اللي كيديروها فالدار — كتبان بسيطة، ولكن الترتيب ديالها هو اللي كيبدّل الطعم."
          align="center"
        />

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {ritual.map((step, index) => (
            <li key={step.step} className="group relative">
              {/* The rule between steps reads as a continuing sequence rather
                  than three unrelated cards. RTL: it points leftward. */}
              {index < ritual.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute -start-4 top-[7.5rem] hidden h-px w-8 bg-gradient-to-l from-brass/45 to-transparent md:block"
                />
              )}

              {/* The step number is set on the photograph — dark in both themes.
                  The title and body below it sit on the page and follow it. */}
              <div
                data-theme="dark"
                className="relative aspect-square overflow-hidden rounded-2xl border brass-hairline"
              >
                <Image
                  src={step.plate}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />

                <span
                  className="absolute end-4 top-4 font-display text-5xl font-bold text-brass/35"
                  dir="ltr"
                >
                  {step.step}
                </span>
              </div>

              <div className="space-y-2.5 px-1 pt-5">
                <h3 className="flex items-center gap-2.5 font-display text-xl font-semibold">
                  <Khatem className="h-3.5 w-3.5 text-brass" strokeWidth={8} />
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-muted text-pretty">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
