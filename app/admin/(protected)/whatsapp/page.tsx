import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import {
  queryWhatsAppLogs,
  extractFailureReason,
} from "@/lib/admin-whatsapp-repo";
import { DatabaseNotConfiguredError } from "@/lib/mongodb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "سجل واتساب — الخير",
};

function firstParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function AdminWhatsAppPage({
  searchParams,
}: PageProps<"/admin/whatsapp">) {
  const params = await searchParams;
  const filters = {
    status: firstParam(params.status),
    search: firstParam(params.search),
    from: firstParam(params.from),
    to: firstParam(params.to),
  };

  let logs: Awaited<ReturnType<typeof queryWhatsAppLogs>>["logs"] = [];
  let fieldErrors: Awaited<ReturnType<typeof queryWhatsAppLogs>>["errors"] = {};
  let loadError: string | null = null;

  try {
    const result = await queryWhatsAppLogs(filters);
    logs = result.logs;
    fieldErrors = result.errors;
  } catch (error) {
    loadError =
      error instanceof DatabaseNotConfiguredError
        ? "قاعدة البيانات غير مهيّأة — راجع MONGODB_URI."
        : "تعذّر جلب سجلات واتساب. حاول مرة أخرى.";
    console.error("[admin/whatsapp] failed to load logs", error);
  }

  const failedCount = logs.filter((log) => !log.success).length;

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">سجل إرسال واتساب</h1>
        <p className="text-ink-muted mt-1">
          {logs.length} محاولة إرسال
          {failedCount > 0 && (
            <span className="text-clay"> — {failedCount} فاشلة</span>
          )}
        </p>
      </div>

      <form
        method="get"
        className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg border brass-hairline bg-surface p-5"
      >
        <div className="space-y-1.5">
          <label htmlFor="search" className="text-xs font-medium text-ink-muted">
            بحث (رقم الطلب أو رقم الهاتف)
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              id="search"
              name="search"
              defaultValue={filters.search}
              className="ps-9"
              placeholder="KH-7F3K2Q, 212612345678"
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
            <option value="success">نجح</option>
            <option value="failed">فشل</option>
          </select>
          {fieldErrors.status && (
            <p className="text-xs text-clay">{fieldErrors.status}</p>
          )}
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

        <div className="flex items-end justify-end gap-2">
          <Link href="/admin/whatsapp">
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

      {!loadError && logs.length === 0 && (
        <div className="rounded-lg border brass-hairline bg-surface p-12 text-center text-ink-muted">
          لا توجد محاولات إرسال مطابقة للتصفية الحالية.
        </div>
      )}

      {!loadError && logs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {logs.map((log, index) => {
            const reason = extractFailureReason(log);
            return (
              <Card key={`${log.orderNumber}-${log.to}-${index}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg" dir="ltr">
                      <Link
                        href={`/order/${log.orderNumber}`}
                        className="hover:underline"
                      >
                        {log.orderNumber}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-ink-muted mt-1" dir="ltr">
                      إلى {log.to}
                    </p>
                  </div>
                  <Badge variant={log.success ? "mint" : "clay"}>
                    {log.success ? "نجح" : "فشل"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {reason && (
                    <p className="rounded-md bg-clay/10 px-3 py-2 text-sm text-clay">
                      {reason}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                    {log.statusCode !== undefined && (
                      <span dir="ltr">HTTP {log.statusCode}</span>
                    )}
                    <span dir="ltr">{log.durationMs}ms</span>
                    <span>{new Date(log.sentAt).toLocaleString("ar-MA")}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
