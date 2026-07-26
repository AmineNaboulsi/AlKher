import { HeroSection } from "@/components/hero/hero-section";
import { CategoryStrip } from "@/components/category-strip";
import { FeaturedProducts } from "@/components/featured-products";
import { PromoSection } from "@/components/promo-section";
import { StorySection } from "@/components/story-section";
import { Footer } from "@/components/footer";
import { SHOW_CATALOG, SHOW_CATEGORIES } from "@/lib/site-config";

export default function Home() {
  return (
    <>
      <HeroSection />
      {SHOW_CATALOG && (
        <>
          {SHOW_CATEGORIES && <CategoryStrip />}
          <FeaturedProducts />
          <PromoSection />
        </>
      )}
      <StorySection />
      <Footer />
    </>
  );
}
