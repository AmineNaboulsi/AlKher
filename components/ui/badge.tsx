import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "mint" | "outline" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variant === "default" && "bg-majorelle/10 text-majorelle",
        variant === "mint" && "bg-mint/10 text-mint",
        variant === "outline" && "border brass-hairline text-brass",
        variant === "muted" && "bg-surface-raised text-ink-muted",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
