import { getDb } from "@/lib/mongodb";
import {
  WHATSAPP_LOGS_COLLECTION,
  type WhatsAppLogEntry,
} from "@/lib/whatsapp-log";
import type { WhatsAppDeliveryResult } from "@/lib/orders";

export type WhatsAppLogFilters = {
  status?: string | null;
  search?: string | null;
  from?: string | null;
  to?: string | null;
};

export type WhatsAppLogFilterErrors = Partial<
  Record<"status" | "from" | "to", string>
>;

/** Log entries without the full outbound request payload — plenty to audit a failure. */
export type WhatsAppLogSummary = Omit<WhatsAppLogEntry, "requestPayload">;

const MAX_RESULTS = 200;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Turns raw (query-string) filter values into a validated MongoDB filter.
 * Mirrors lib/admin-orders-repo.ts so both admin list views agree on how
 * filters are validated and errors reported.
 */
export function buildWhatsAppLogFilter(filters: WhatsAppLogFilters): {
  filter: Record<string, unknown>;
  errors: WhatsAppLogFilterErrors;
} {
  const filter: Record<string, unknown> = {};
  const errors: WhatsAppLogFilterErrors = {};

  const status = filters.status?.trim();
  if (status) {
    if (status === "success") filter.success = true;
    else if (status === "failed") filter.success = false;
    else errors.status = "الحالة غير صحيحة. القيم المسموحة: success, failed";
  }

  const search = filters.search?.trim();
  if (search) {
    const pattern = escapeRegex(search);
    filter.$or = [
      { orderNumber: { $regex: pattern, $options: "i" } },
      { to: { $regex: pattern, $options: "i" } },
    ];
  }

  const sentAt: Record<string, Date> = {};

  const from = filters.from?.trim();
  if (from) {
    const date = new Date(from);
    if (Number.isNaN(date.getTime())) {
      errors.from = "تاريخ البداية غير صحيحة.";
    } else {
      sentAt.$gte = date;
    }
  }

  const to = filters.to?.trim();
  if (to) {
    const date = new Date(to);
    if (Number.isNaN(date.getTime())) {
      errors.to = "تاريخ النهاية غير صحيحة.";
    } else {
      date.setHours(23, 59, 59, 999);
      sentAt.$lte = date;
    }
  }

  if (Object.keys(sentAt).length > 0) filter.sentAt = sentAt;

  return { filter, errors };
}

export async function queryWhatsAppLogs(
  filters: WhatsAppLogFilters
): Promise<{ logs: WhatsAppLogSummary[]; errors: WhatsAppLogFilterErrors }> {
  const { filter, errors } = buildWhatsAppLogFilter(filters);
  if (Object.keys(errors).length > 0) return { logs: [], errors };

  const db = await getDb();
  const logs = await db
    .collection<WhatsAppLogEntry>(WHATSAPP_LOGS_COLLECTION)
    .find(filter, { projection: { _id: 0, requestPayload: 0 } })
    .sort({ sentAt: -1 })
    .limit(MAX_RESULTS)
    .toArray();

  return { logs: logs as WhatsAppLogSummary[], errors };
}

/**
 * Turns a failed log entry into a human-readable reason: the thrown error
 * message when the request itself failed (network error, timeout), or
 * Meta's own error payload when the request succeeded but Meta rejected the
 * template (invalid number, template not approved, etc). Returns null for
 * successful sends.
 */
export function extractFailureReason(
  log: Pick<WhatsAppLogSummary, "success" | "error" | "response" | "statusCode">
): string | null {
  if (log.success) return null;
  if (log.error) return log.error;

  const response = log.response;
  if (response && typeof response === "object" && "error" in response) {
    const metaError = (
      response as {
        error?: { message?: string; code?: number; error_subcode?: number };
      }
    ).error;
    if (metaError?.message) {
      const parts = [metaError.message];
      if (metaError.code !== undefined) parts.push(`code ${metaError.code}`);
      if (metaError.error_subcode !== undefined) {
        parts.push(`subcode ${metaError.error_subcode}`);
      }
      return parts.length > 1
        ? `${parts[0]} (${parts.slice(1).join(", ")})`
        : parts[0];
    }
  }

  if (typeof response === "string" && response.trim()) {
    return response.slice(0, 300);
  }

  return log.statusCode ? `HTTP ${log.statusCode}` : "خطأ غير معروف.";
}

export type WhatsAppOrderStatus = "sent" | "partial" | "failed" | "unsent" | "pending";

/**
 * Summarises the lightweight per-order WhatsApp results (stored on the order
 * document itself) into one status for the orders dashboard badge. The full
 * per-attempt audit trail — including Meta's error — lives in
 * {@link queryWhatsAppLogs} / the WhatsApp monitoring page.
 */
export function summariseWhatsAppStatus(
  whatsapp: WhatsAppDeliveryResult[] | undefined
): WhatsAppOrderStatus {
  if (whatsapp === undefined) return "pending";
  if (whatsapp.length === 0) return "unsent";
  const failedCount = whatsapp.filter((r) => !r.success).length;
  if (failedCount === 0) return "sent";
  if (failedCount === whatsapp.length) return "failed";
  return "partial";
}
