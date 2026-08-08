import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products-repo";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

export async function FeaturedProducts() {
  const featured = await getFeaturedProducts(4);
  if (featured.length === 0) return null;

  return (
    <section id="shelf" className="page-wash relative py-20 sm:py-28">
      {/* The shelf is the page's centre of gravity — a faint zellige ground
          keeps it from reading as a plain dark rectangle. */}
      <div className="zellige-field pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="على الرفّ"
          title="أربع علب، كيعرفهم البراد المغربي"
          blurb="كل علبة كما وصلات من المورّد — بأثمنة المحل، بلا زيادة."
          action={{ href: "/shop", label: "كل المنتجات" }}
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              eager={index === 0}
            />
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Button asChild variant="outline" size="lg">
            <Link href="/shop">عرض كل المنتجات</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
