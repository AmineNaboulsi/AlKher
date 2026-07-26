import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { Footer } from "@/components/footer";
import { SHOW_CATALOG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "السلة — الخير",
  description: "مراجعة سلة التسوق.",
};

export default function CartPage() {
  if (!SHOW_CATALOG) notFound();

  return (
    <>
      <CartView />
      <Footer />
    </>
  );
}
