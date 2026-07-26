import { cn } from "@/lib/utils";

type ZelligeDividerProps = {
  className?: string;
  variant?: "full" | "compact";
};

export function ZelligeDivider({
  className,
  variant = "full",
}: ZelligeDividerProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden text-brass/25",
        variant === "compact" ? "py-6" : "py-12",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="zellige-star"
            x="0"
            y="0"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M24 0 L30 18 L48 24 L30 30 L24 48 L18 30 L0 24 L18 18 Z"
              fill="currentColor"
              opacity="0.6"
            />
            <path
              d="M24 8 L28 20 L40 24 L28 28 L24 40 L20 28 L8 24 L20 20 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.4"
            />
          </pattern>
        </defs>
        <rect width="1200" height="48" fill="url(#zellige-star)" />
        <line
          x1="0"
          y1="24"
          x2="1200"
          y2="24"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
