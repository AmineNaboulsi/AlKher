import { notFound } from "next/navigation";
import { ShopClient } from "@/components/shop-client";
import { SHOW_CATALOG } from "@/lib/site-config";
import { getActiveProducts } from "@/lib/products-repo";
import type { Metadata } from "next";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "المتجر — الخير",
  description:
    "تصفّح علب الشاي الأخضر الصيني للأتاي المغربي — لاس بالماس، الساقية الحمراء، سمارة، بيت الفخامة.",
};

export default async function ShopPage({
  searchParams,
}: PageProps<"/shop">) {
  if (!SHOW_CATALOG) notFound();

  const { category } = await searchParams;
  const initialCategory =
    typeof category === "string" ? category : undefined;

  const products = await getActiveProducts();

  return <ShopClient products={products} initialCategory={initialCategory} />;
}
