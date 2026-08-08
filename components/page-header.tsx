import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SectionKicker } from "@/components/khatem";

export type Crumb = { href?: string; label: string };

/**
 * The banner every inner page opens on: a rendered plate, the breadcrumb, and
 * the title set live over it.
 *
 * The plate arrives already scrimmed from the Remotion render, so this adds
 * only one extra ramp for the fold where the header bar overlaps it.
 */
export function PageHeader({
  plate,
  kicker,
  title,
  blurb,
  crumbs = [],
}: {
  plate: string;
  kicker: string;
  title: string;
  blurb?: string;
  crumbs?: Crumb[];
}) {
  return (
    // Dark in both themes — the plate behind it is a dark photograph.
    <header
      data-theme="dark"
      className="relative isolate overflow-hidden border-b brass-hairline"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={plate}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-night/70 to-night/85" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-32 sm:px-6 sm:pb-16 sm:pt-36 lg:px-8">
        {crumbs.length > 0 && (
          <nav aria-label="مسار التصفح" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              {crumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-brass"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-ink">{crumb.label}</span>
                  )}
                  {index < crumbs.length - 1 && (
                    <ChevronLeft className="h-4 w-4 text-ink-faint" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="max-w-2xl space-y-3">
          <SectionKicker>{kicker}</SectionKicker>
          <h1 className="font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">
            {title}
          </h1>
          {blurb && (
            <p className="text-base leading-relaxed text-ink-muted text-pretty">
              {blurb}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
