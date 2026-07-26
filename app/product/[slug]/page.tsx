import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, products } from "@/lib/products";
import { ProductDetail } from "@/components/product-detail";
import { SHOW_CATALOG } from "@/lib/site-config";

export function generateStaticParams() {
  if (!SHOW_CATALOG) return [];
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  if (!SHOW_CATALOG) return { title: "منتج غير موجود" };

  const { slug } = await params;
  const product = getProductBySlug(slug);
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
  const product = getProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
