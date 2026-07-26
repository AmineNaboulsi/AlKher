import { cn } from "@/lib/utils";
import type { Category } from "@/lib/products";
import { Leaf, Sprout, Sparkles } from "lucide-react";

const categoryIcons: Record<Category, React.ReactNode> = {
  شنمي: <Sprout className="h-8 w-8" />,
  "أخضر فاخر": <Sparkles className="h-8 w-8" />,
  "أخضر صيني": <Leaf className="h-8 w-8" />,
};

const categoryGradients: Record<Category, string> = {
  شنمي: "from-mint/15 to-mint-deep/5",
  "أخضر فاخر": "from-brass/15 to-brass-light/5",
  "أخضر صيني": "from-majorelle/10 to-majorelle-glow/5",
};

type ProductPlaceholderProps = {
  category: Category;
  className?: string;
};

export function ProductPlaceholder({
  category,
  className,
}: ProductPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        categoryGradients[category],
        className
      )}
      aria-hidden="true"
    >
      <div className="text-brass/50">{categoryIcons[category]}</div>
    </div>
  );
}
