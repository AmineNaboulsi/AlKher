import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { queryOrders, ORDER_STATUSES } from "@/lib/admin-orders-repo";
import { summariseWhatsAppStatus } from "@/lib/admin-whatsapp-repo";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import { CITIES } from "@/lib/checkout-config";
import { DatabaseNotConfiguredError } from "@/lib/mongodb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/price";
import { WhatsAppStatusBadge } from "@/components/whatsapp-status-badge";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "لوحة الطلبات — الخير",
};

const STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  "default" | "mint" | "outline" | "muted"
> = {
  pending: "default",
  confirmed: "mint",
  shipped: "mint",
  cancelled: "muted",
};

function firstParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin">) {
  const params = await searchParams;
  const filters = {
    status: firstParam(params.status),
    city: firstParam(params.city),
    from: firstParam(params.from),
    to: firstParam(params.to),
    search: firstParam(params.search),
  };

  let orders: Awaited<ReturnType<typeof queryOrders>>["orders"] = [];
  let fieldErrors: Awaited<ReturnType<typeof queryOrders>>["errors"] = {};
  let loadError: string | null = null;

  try {
    const result = await queryOrders(filters);
    orders = result.orders;
    fieldErrors = result.errors;
  } catch (error) {
    loadError =
      error instanceof DatabaseNotConfiguredError
        ? "قاعدة البيانات غير مهيّأة — راجع MONGODB_URI."
        : "تعذّر جلب الطلبات. حاول مرة أخرى.";
    console.error("[admin] failed to load orders", error);
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">الطلبات</h1>
        <p className="text-ink-muted mt-1">{orders.length} طلب مطابق للتصفية</p>
      </div>

      <form
        method="get"
        className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 rounded-lg border brass-hairline bg-surface p-5"
      >
        <div className="lg:col-span-2 space-y-1.5">
          <label htmlFor="search" className="text-xs font-medium text-ink-muted">
            بحث (رقم الطلب، الهاتف، الاسم)
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              id="search"
              name="search"
              defaultValue={filters.search}
              className="ps-9"
              placeholder="KH-7F3K2Q, 0612345678, ..."
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="status" className="text-xs font-medium text-ink-muted">
            الحالة
          </label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status}
            className="flex h-10 w-full rounded-md border brass-hairline bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            <option value="">الكل</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          {fieldErrors.status && (
            <p className="text-xs text-clay">{fieldErrors.status}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="city" className="text-xs font-medium text-ink-muted">
            المدينة
          </label>
          <select
            id="city"
            name="city"
            defaultValue={filters.city}
            className="flex h-10 w-full rounded-md border brass-hairline bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            <option value="">الكل</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label htmlFor="from" className="text-xs font-medium text-ink-muted">
              من تاريخ
            </label>
            <Input id="from" name="from" type="date" defaultValue={filters.from} />
            {fieldErrors.from && (
              <p className="text-xs text-clay">{fieldErrors.from}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="to" className="text-xs font-medium text-ink-muted">
              إلى تاريخ
            </label>
            <Input id="to" name="to" type="date" defaultValue={filters.to} />
            {fieldErrors.to && (
              <p className="text-xs text-clay">{fieldErrors.to}</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-end gap-2">
          <Link href="/admin">
            <Button type="button" variant="ghost" size="sm">
              إعادة ضبط
            </Button>
          </Link>
          <Button type="submit" size="sm">
            تصفية
          </Button>
        </div>
      </form>

      {loadError && (
        <div className="rounded-lg border brass-hairline bg-surface p-8 text-center text-clay">
          {loadError}
        </div>
      )}

      {!loadError && orders.length === 0 && (
        <div className="rounded-lg border brass-hairline bg-surface p-12 text-center text-ink-muted">
          لا توجد طلبات مطابقة للتصفية الحالية.
        </div>
      )}

      {!loadError && orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {orders.map((order) => (
            <Card key={order.orderNumber}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg" dir="ltr">
                    {order.orderNumber}
                  </CardTitle>
                  <p className="text-sm text-ink-muted mt-1">
                    {new Date(order.createdAt).toLocaleString("ar-MA")}
                  </p>
                </div>
                <Badge variant={STATUS_BADGE_VARIANT[order.status]}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{order.customer.fullName}</p>
                  <p className="text-sm text-ink-muted" dir="ltr">
                    {order.customer.phone}
                  </p>
                  <p className="text-sm text-ink-muted">{order.customer.city}</p>
                </div>

                <div className="flex items-center justify-between border-t brass-hairline pt-3">
                  <span className="text-sm text-ink-muted">
                    {order.items.length} منتج
                  </span>
                  <Price amount={order.totalMAD} className="font-semibold" />
                </div>

                <Link
                  href={`/admin/whatsapp?search=${encodeURIComponent(order.orderNumber)}`}
                  className="block"
                >
                  <WhatsAppStatusBadge
                    status={summariseWhatsAppStatus(order.whatsapp)}
                  />
                </Link>

                <Link
                  href={`/order/${order.orderNumber}`}
                  className="block text-center text-sm text-majorelle hover:underline"
                >
                  عرض التفاصيل
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
