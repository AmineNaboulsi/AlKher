import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "منتج جديد — الخير",
};

export default function NewProductPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">منتج جديد</h1>
      </div>
      <ProductForm />
    </>
  );
}
