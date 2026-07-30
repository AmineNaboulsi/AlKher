/**
 * Order notifications over the Meta WhatsApp Cloud API.
 *
 * Sends a pre-approved message template (name/language from
 * WHATSAPP_TEMPLATE_NAME/WHATSAPP_TEMPLATE_LANG) with a dynamic URL button
 * linking to the order's details page. Templates are required here because
 * this is a business-initiated message — free-form/interactive messages only
 * deliver within the 24-hour window after a recipient has messaged the
 * business number, which order notifications can't rely on. The template
 * must be created and approved in Meta Business Manager with one body
 * variable (the order number) and a dynamic URL button (sub_type "url")
 * whose base is `${SITE_URL}/order/` and whose `{{1}}` suffix is the order
 * number.
 *
 * Every send attempt — success or failure, full request payload and Meta's
 * raw response — is logged via {@link logWhatsAppAttempt} for auditing,
 * independently of the lightweight per-order summary returned here.
 */
import type { OrderDocument, WhatsAppDeliveryResult } from "@/lib/orders";
import { logWhatsAppAttempt } from "@/lib/whatsapp-log";
import { getSiteSettings } from "@/lib/site-settings-repo";

const METHOD = "sendTemplateMessage";

const GRAPH_API_VERSION = "v21.0";

/**
 * Accepts either a local Moroccan number (`0XXXXXXXXX`, as stored on orders)
 * or an already-international one (`+212XXXXXXXXX`, as used for owner
 * numbers) and returns the E.164-without-plus form the Graph API expects.
 */
function toGraphNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return raw.startsWith("0") ? `212${digits.slice(1)}` : digits;
}

function orderUrl(orderNumber: string): string {
  const base = (process.env.SITE_URL ?? "http://localhost:3001").replace(/\/$/, "");
  return `${base}/order/${orderNumber}`;
}

async function sendTemplateMessage(
  to: string,
  orderNumber: string,
  token: string,
  phoneNumberId: string
): Promise<WhatsAppDeliveryResult> {
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME ?? "order_confirmation";
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG ?? "ar";

  const requestBody = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: templateLang },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: orderNumber }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: orderNumber }],
        },
      ],
    },
  };

  const sentAt = new Date();
  const startedAt = Date.now();

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const rawBody = await res.text();
    let response: unknown = rawBody;
    try {
      response = JSON.parse(rawBody);
    } catch {
      // Meta didn't return JSON — keep the raw text as the stored response.
    }

    const durationMs = Date.now() - startedAt;

    if (!res.ok) {
      console.error(
        `[whatsapp] send failed (${res.status}) to ${to} for order ${orderNumber}: ${rawBody}`
      );
      await logWhatsAppAttempt({
        orderNumber,
        to,
        method: METHOD,
        requestPayload: requestBody,
        response,
        statusCode: res.status,
        success: false,
        durationMs,
        sentAt,
      });
      return { to, success: false, statusCode: res.status, response, durationMs, sentAt };
    }

    const messageId =
      response && typeof response === "object" && "messages" in response
        ? (response as { messages?: { id?: string }[] }).messages?.[0]?.id
        : undefined;

    console.log(`[whatsapp] sent order ${orderNumber} notification to ${to} -> ${orderUrl(orderNumber)}`);
    await logWhatsAppAttempt({
      orderNumber,
      to,
      method: METHOD,
      requestPayload: requestBody,
      response,
      statusCode: res.status,
      success: true,
      durationMs,
      sentAt,
    });
    return { to, success: true, statusCode: res.status, messageId, response, durationMs, sentAt };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[whatsapp] send threw to ${to} for order ${orderNumber}`, error);
    await logWhatsAppAttempt({
      orderNumber,
      to,
      method: METHOD,
      requestPayload: requestBody,
      success: false,
      error: message,
      durationMs,
      sentAt,
    });
    return { to, success: false, error: message, durationMs, sentAt };
  }
}

/**
 * Notifies the customer (unless disabled via settings.sendCustomerWhatsApp)
 * and every configured store-alert number on WhatsApp, each with a link to
 * the order's details page. Best-effort and parallel: one recipient failing
 * (bad number, Meta outage) never blocks the others or the order-creation
 * response. Returns each recipient's outcome (including Meta's raw response)
 * so callers can persist it for delivery verification.
 */
export async function sendOrderWhatsAppMessage(
  order: OrderDocument
): Promise<WhatsAppDeliveryResult[]> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn(
      "[whatsapp] WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID not set — skipping notification for",
      order.orderNumber
    );
    return [];
  }

  const settings = await getSiteSettings();
  const recipients = [
    ...(settings.sendCustomerWhatsApp ? [toGraphNumber(order.customer.phone)] : []),
    ...settings.orderAlertPhones.map(toGraphNumber),
  ];

  return Promise.all(
    recipients.map((to) =>
      sendTemplateMessage(to, order.orderNumber, token, phoneNumberId)
    )
  );
}
