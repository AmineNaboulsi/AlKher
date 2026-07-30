import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getActiveProductBySlug } from "@/lib/products-repo";
import { getAdLandingCopy } from "@/lib/ad-landing-copy";
import { AdLandingPage } from "@/components/ad-landing-page";
import { SHOW_CATALOG } from "@/lib/site-config";

export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: PageProps<"/lp/[slug]">): Promise<Metadata> {
  if (!SHOW_CATALOG) return { title: "منتج غير موجود" };

  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);
  const copy = getAdLandingCopy(slug);
  if (!product || !copy) return { title: "منتج غير موجود" };

  return {
    title: `${copy.headline} — الخير`,
    description: copy.subheadline,
  };
}

export default async function AdLandingRoute({
  params,
}: PageProps<"/lp/[slug]">) {
  if (!SHOW_CATALOG) notFound();

  const { slug } = await params;
  const copy = getAdLandingCopy(slug);
  if (!copy) notFound();

  const product = await getActiveProductBySlug(slug);
  if (!product) notFound();

  return <AdLandingPage product={product} copy={copy} />;
}
