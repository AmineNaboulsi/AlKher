import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getActiveProductBySlug, getRelatedProducts } from "@/lib/products-repo";
import { ProductDetail } from "@/components/product-detail";
import { SHOW_CATALOG } from "@/lib/site-config";

export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  if (!SHOW_CATALOG) return { title: "منتج غير موجود" };

  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);
  if (!product) return { title: "منتج غير موجود" };
  return {
    title: `${product.name} — الخير`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  if (!SHOW_CATALOG) notFound();

  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);
  return <ProductDetail product={product} related={related} />;
}
