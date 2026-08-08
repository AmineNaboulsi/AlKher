import { cn } from "@/lib/utils";

/**
 * The khatem — the eight-pointed star at the centre of Moroccan zellige, and
 * the brand's mark. It is two squares, one turned 45°, which is exactly how the
 * tile is cut; drawing it that way rather than as a traced path means it stays
 * geometrically true at any size.
 *
 * Inherits `currentColor`, so it takes the colour of whatever it sits in.
 */
export function Khatem({
  className,
  filled = false,
  strokeWidth = 4,
}: {
  className?: string;
  filled?: boolean;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      >
        <rect x="20.3" y="20.3" width="59.4" height="59.4" />
        <rect
          x="20.3"
          y="20.3"
          width="59.4"
          height="59.4"
          transform="rotate(45 50 50)"
        />
      </g>
    </svg>
  );
}

/** A hairline rule with a khatem sitting in the middle of it. */
export function BrassRule({
  className,
  star = true,
}: {
  className?: string;
  star?: boolean;
}) {
  return (
    <div
      className={cn("flex items-center gap-4 text-brass/60", className)}
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-gradient-to-l from-brass/50 to-transparent" />
      {star && <Khatem className="h-3.5 w-3.5" strokeWidth={7} />}
      <span className="h-px flex-1 bg-gradient-to-r from-brass/50 to-transparent" />
    </div>
  );
}

/**
 * Small brass label above a section heading. Sets the eyebrow, the star and the
 * tracking in one place so every section opens the same way.
 */
export function SectionKicker({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-brass",
        className
      )}
    >
      <Khatem className="h-3 w-3" strokeWidth={8} />
      {children}
    </p>
  );
}
