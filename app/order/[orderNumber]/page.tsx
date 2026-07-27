import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Price } from "@/components/price";
import { getOrderByNumber } from "@/lib/orders-repo";
import type { OrderStatus } from "@/lib/orders";

export const runtime = "nodejs";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "قيد المعالجة",
  confirmed: "تم التأكيد",
  shipped: "في الطريق إليك",
  cancelled: "ملغى",
};

export const metadata: Metadata = {
  title: "تفاصيل الطلب — الخير",
};

export default async function OrderPage({
  params,
}: PageProps<"/order/[orderNumber]">) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber.toUpperCase());
  if (!order) notFound();

  return (
    <>
      <div className="pt-24 pb-12 sm:pt-28 min-h-[60vh]">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8">
            <Link href="/" className="hover:text-ink transition-colors">
              الرئيسية
            </Link>
            <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
            <span className="text-ink">تفاصيل الطلب</span>
          </nav>

          <div className="rounded-lg border brass-hairline bg-surface p-8 sm:p-10 space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/10 text-mint">
              <BadgeCheck className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold">
                طلب {order.customer.fullName}
              </h1>
              <p className="text-ink-muted">
                رقم الطلب:{" "}
                <span className="font-semibold text-brass" dir="ltr">
                  {order.orderNumber}
                </span>
              </p>
              <p className="text-ink-muted">
                الحالة:{" "}
                <span className="text-ink">{STATUS_LABELS[order.status]}</span>
              </p>
            </div>

            <dl className="mx-auto max-w-xs space-y-2 text-sm text-start">
              {order.items.map((line) => (
                <div
                  key={`${line.slug}-${line.weightGrams}`}
                  className="flex justify-between gap-2"
                >
                  <dt className="text-ink-muted">
                    {line.name} ({line.weightGrams} غ) × {line.quantity}
                  </dt>
                  <dd>
                    <Price amount={line.lineTotalMAD} />
                  </dd>
                </div>
              ))}
              {order.discountMAD > 0 && (
                <div className="flex justify-between">
                  <dt className="text-clay">وفّرت</dt>
                  <dd>
                    <Price amount={order.discountMAD} className="text-clay" />
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-muted">المجموع الفرعي</dt>
                <dd>
                  <Price amount={order.subtotalMAD} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">التوصيل</dt>
                <dd>
                  <Price amount={order.deliveryFeeMAD} />
                </dd>
              </div>
              <div className="flex justify-between font-semibold text-ink pt-2 border-t brass-hairline">
                <dt>المجموع</dt>
                <dd>
                  <Price amount={order.totalMAD} />
                </dd>
              </div>
            </dl>

            <p className="text-ink-muted leading-relaxed">
              التوصيل إلى {order.customer.city} — الدفع نقداً عند الاستلام.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
