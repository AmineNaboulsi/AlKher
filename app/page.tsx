import { HeroSection } from "@/components/hero/hero-section";
import { MarqueeBand } from "@/components/marquee-band";
import { CollectionsSection } from "@/components/collections-section";
import { FeaturedProducts } from "@/components/featured-products";
import { PromoSection } from "@/components/promo-section";
import { RitualSection } from "@/components/ritual-section";
import { StorySection } from "@/components/story-section";
import { Assurances } from "@/components/assurances";
import { CtaBand } from "@/components/cta-band";
import { Footer } from "@/components/footer";
import { SHOW_CATALOG, SHOW_CATEGORIES } from "@/lib/site-config";

/**
 * The page reads as a visit: you are welcomed (hero), told what is on the shelf
 * (products, offers), shown how it is made (ritual), told who is pouring
 * (story), reassured (assurances), and asked once (CTA). Sections alternate
 * between a lit surface and the page ground so the eye keeps moving.
 */
export default function Home() {
  return (
    <>
      <HeroSection />
      <MarqueeBand />
      {SHOW_CATALOG && (
        <>
          <FeaturedProducts />
          {SHOW_CATEGORIES && <CollectionsSection />}
          <PromoSection />
        </>
      )}
      <RitualSection />
      <StorySection />
      <Assurances />
      <CtaBand />
      <Footer />
    </>
  );
}
