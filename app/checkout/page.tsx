import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { Footer } from "@/components/footer";
import { SHOW_CATALOG } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الدفع عند الاستلام — الخير",
  description: "إتمام الطلب والدفع نقداً عند التسليم.",
};

export default function CheckoutPage() {
  if (!SHOW_CATALOG) notFound();

  return (
    <>
      <div className="pt-24 pb-12 sm:pt-28 min-h-[60vh]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8">
            <Link href="/" className="hover:text-ink transition-colors">
              الرئيسية
            </Link>
            <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
            <Link href="/cart" className="hover:text-ink transition-colors">
              السلة
            </Link>
            <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
            <span className="text-ink">الدفع</span>
          </nav>

          <CheckoutForm />
        </div>
      </div>
      <Footer />
    </>
  );
}
