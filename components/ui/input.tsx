import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        // Recessed rather than raised: an input on `bg-surface` would vanish
        // into the card it sits in, so it takes the page's darkest ground.
        "flex h-11 w-full rounded-xl border brass-hairline bg-background px-4 py-2 text-sm text-ink transition-colors placeholder:text-ink-faint hover:border-brass/40 focus-visible:border-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40 aria-[invalid=true]:border-clay/60 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
