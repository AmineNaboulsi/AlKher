import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SectionKicker } from "@/components/khatem";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Every section opens the same way: brass kicker, display heading, one muted
 * line, and — optionally — a link out on the far side. Keeping it in one
 * component is what makes eight different sections read as one page.
 */
export function SectionHeading({
  kicker,
  title,
  blurb,
  action,
  align = "start",
  className,
}: {
  kicker: string;
  title: React.ReactNode;
  blurb?: string;
  action?: { href: string; label: string };
  align?: "start" | "center";
  className?: string;
}) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex gap-6",
        centered
          ? "flex-col items-center text-center"
          : "flex-col items-start justify-between sm:flex-row sm:items-end",
        className
      )}
    >
      <div
        className={cn(
          "space-y-3",
          centered ? "flex flex-col items-center" : "max-w-2xl"
        )}
      >
        <SectionKicker>{kicker}</SectionKicker>
        <h2 className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">
          {title}
        </h2>
        {blurb && (
          <p className="text-base leading-relaxed text-ink-muted text-pretty">
            {blurb}
          </p>
        )}
      </div>

      {action && (
        <Button asChild variant="ghost" className="shrink-0 text-brass">
          <Link href={action.href}>
            {action.label}
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
