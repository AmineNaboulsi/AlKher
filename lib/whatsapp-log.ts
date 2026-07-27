import { getDb } from "@/lib/mongodb";

export const WHATSAPP_LOGS_COLLECTION = "whatsapp_logs";

/**
 * Full record of one WhatsApp send attempt — the exact payload sent to Meta,
 * Meta's raw response, timing, and outcome. Written for every attempt
 * (success or failure) so delivery can be audited independently of the
 * lightweight summary kept on the order document.
 */
export type WhatsAppLogEntry = {
  orderNumber: string;
  to: string;
  method: string;
  requestPayload: unknown;
  response?: unknown;
  statusCode?: number;
  success: boolean;
  error?: string;
  durationMs: number;
  sentAt: Date;
};

/**
 * Best-effort: a logging failure must never surface to the caller or affect
 * message sending / order creation.
 */
export async function logWhatsAppAttempt(entry: WhatsAppLogEntry): Promise<void> {
  try {
    const db = await getDb();
    await db.collection<WhatsAppLogEntry>(WHATSAPP_LOGS_COLLECTION).insertOne(entry);
  } catch (error) {
    console.error(
      `[whatsapp] failed to log send attempt for order ${entry.orderNumber} -> ${entry.to}`,
      error
    );
  }
}
