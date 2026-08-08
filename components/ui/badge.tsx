import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "mint" | "outline" | "muted" | "clay" | "brass";
}) {
  return (
    <span
      className={cn(
        // Tinted fills need more alpha on a dark ground than on white before
        // they read as a colour at all.
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variant === "default" &&
          "bg-majorelle/18 text-majorelle-glow ring-1 ring-inset ring-majorelle/25",
        variant === "mint" &&
          "bg-mint/16 text-mint ring-1 ring-inset ring-mint/30",
        variant === "outline" && "border brass-hairline-strong text-brass",
        variant === "muted" && "bg-surface-raised text-ink-muted",
        variant === "clay" &&
          "bg-clay/18 text-clay ring-1 ring-inset ring-clay/30",
        variant === "brass" &&
          "bg-brass/16 text-brass-light ring-1 ring-inset ring-brass/35",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
