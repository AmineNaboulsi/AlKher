import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlugForAdmin } from "@/lib/admin-products-repo";
import { ProductForm } from "@/components/admin/product-form";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "تعديل منتج — الخير",
};

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[slug]/edit">) {
  const { slug } = await params;
  const product = await getProductBySlugForAdmin(slug);
  if (!product) notFound();

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">تعديل {product.name}</h1>
      </div>
      <ProductForm product={product} />
    </>
  );
}
