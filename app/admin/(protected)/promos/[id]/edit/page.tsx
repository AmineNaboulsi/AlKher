import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPromoByIdForAdmin } from "@/lib/admin-promos-repo";
import { getActiveProducts } from "@/lib/products-repo";
import { PromoForm } from "@/components/admin/promo-form";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "تعديل عرض — الخير",
};

export default async function EditPromoPage({
  params,
}: PageProps<"/admin/promos/[id]/edit">) {
  const { id } = await params;
  const [promo, products] = await Promise.all([
    getPromoByIdForAdmin(id),
    getActiveProducts(),
  ]);
  if (!promo) notFound();

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">تعديل {promo.name}</h1>
      </div>
      <PromoForm promo={promo} products={products} />
    </>
  );
}
