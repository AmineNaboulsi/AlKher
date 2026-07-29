import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/products-repo";
import { PromoForm } from "@/components/admin/promo-form";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "عرض جديد — الخير",
};

export default async function NewPromoPage() {
  const products = await getActiveProducts();

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">عرض جديد</h1>
      </div>
      <PromoForm products={products} />
    </>
  );
}
