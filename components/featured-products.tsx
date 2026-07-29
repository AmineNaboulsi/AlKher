import { getFeaturedProducts } from "@/lib/products-repo";
import { ProductCard } from "@/components/product-card";
import { ZelligeDivider } from "@/components/zellige-divider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export async function FeaturedProducts() {
  const featured = await getFeaturedProducts(4);

  return (
    <section className="py-12 sm:py-16">
      <ZelligeDivider variant="compact" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">
              مختاراتنا
            </h2>
            <p className="text-ink-muted mt-2 text-sm sm:text-base">
              أربعة أنواع، كلها متوفرة
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:flex">
            <Link href="/shop">
              كل المنتجات
              <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              eager={index === 0}
            />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/shop">عرض كل المنتجات</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
