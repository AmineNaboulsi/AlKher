import type { SiteSettingsInput } from "@/lib/site-settings-repo";

export type SettingsFieldErrors = Partial<
  Record<"storeName" | "contactPhone" | "contactEmail" | "address", string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validates a PATCH body for /admin/settings — every field is optional (partial update). */
export function validateSettingsInput(body: Record<string, unknown>): {
  fields: SettingsFieldErrors;
  value: SiteSettingsInput | null;
} {
  const fields: SettingsFieldErrors = {};
  const value: SiteSettingsInput = {};

  if (body.storeName !== undefined) {
    const storeName = typeof body.storeName === "string" ? body.storeName.trim() : "";
    if (storeName.length < 1 || storeName.length > 80) {
      fields.storeName = "اسم المتجر مطلوب (حتى 80 حرفاً).";
    } else {
      value.storeName = storeName;
    }
  }

  if (body.contactPhone !== undefined) {
    const contactPhone =
      typeof body.contactPhone === "string" ? body.contactPhone.trim() : "";
    if (contactPhone.length < 5 || contactPhone.length > 30) {
      fields.contactPhone = "رقم الهاتف غير صحيح.";
    } else {
      value.contactPhone = contactPhone;
    }
  }

  if (body.contactEmail !== undefined) {
    const raw = typeof body.contactEmail === "string" ? body.contactEmail.trim() : "";
    if (raw.length === 0) {
      value.contactEmail = null;
    } else if (!EMAIL_PATTERN.test(raw)) {
      fields.contactEmail = "البريد الإلكتروني غير صحيح.";
    } else {
      value.contactEmail = raw;
    }
  }

  if (body.address !== undefined) {
    const address = typeof body.address === "string" ? body.address.trim() : "";
    if (address.length < 1 || address.length > 200) {
      fields.address = "العنوان مطلوب (حتى 200 حرف).";
    } else {
      value.address = address;
    }
  }

  if (body.orderAlertPhones !== undefined) {
    value.orderAlertPhones = Array.isArray(body.orderAlertPhones)
      ? body.orderAlertPhones
          .filter((n): n is string => typeof n === "string")
          .map((n) => n.trim())
          .filter(Boolean)
      : [];
  }

  if (body.sendCustomerWhatsApp !== undefined) {
    value.sendCustomerWhatsApp = Boolean(body.sendCustomerWhatsApp);
  }

  if (Object.keys(fields).length > 0) {
    return { fields, value: null };
  }

  return { fields: {}, value };
}
