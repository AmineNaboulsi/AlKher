import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-majorelle text-white hover:bg-majorelle-glow shadow-[0_10px_30px_rgba(76,107,245,0.3)]",
        secondary:
          "bg-surface-raised text-ink border brass-hairline hover:border-brass/45 hover:bg-surface",
        outline:
          "border brass-hairline-strong bg-transparent text-ink hover:bg-brass/10 hover:border-brass",
        ghost: "text-ink hover:bg-surface-raised",
        // The one true CTA: lit brass on a dark page, with the tray's own
        // gradient rather than a flat fill.
        brass:
          "bg-gradient-to-bl from-brass-light to-brass text-night font-semibold shadow-brass hover:brightness-110 hover:-translate-y-px active:translate-y-0",
        mint: "bg-mint text-night font-semibold hover:bg-mint/90 shadow-[0_10px_30px_rgba(63,203,147,0.24)]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
