"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { SiteSettings } from "@/lib/site-settings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FieldErrors = Partial<
  Record<"storeName" | "contactPhone" | "contactEmail" | "address", string>
>;

type SettingsFormProps = {
  settings: SiteSettings;
};

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail ?? "");
  const [address, setAddress] = useState(settings.address);
  const [orderAlertPhonesText, setOrderAlertPhonesText] = useState(
    settings.orderAlertPhones.join("\n")
  );
  const [sendCustomerWhatsApp, setSendCustomerWhatsApp] = useState(
    settings.sendCustomerWhatsApp
  );

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    setSaved(false);

    const body = {
      storeName,
      contactPhone,
      contactEmail,
      address,
      orderAlertPhones: orderAlertPhonesText
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean),
      sendCustomerWhatsApp,
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "تعذّر حفظ الإعدادات.");
        setFieldErrors(data.fields ?? {});
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setFormError("تعذّر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl" noValidate>
      {formError && (
        <p
          role="alert"
          className="rounded-md border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay"
        >
          {formError}
        </p>
      )}

      {saved && !formError && (
        <p className="rounded-md border border-mint/40 bg-mint/5 px-4 py-3 text-sm text-mint">
          تم حفظ الإعدادات.
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="storeName" className="block text-sm font-medium">
          اسم المتجر
        </label>
        <Input
          id="storeName"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          aria-invalid={Boolean(fieldErrors.storeName)}
          required
        />
        {fieldErrors.storeName && (
          <p className="text-xs text-clay">{fieldErrors.storeName}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contactPhone" className="block text-sm font-medium">
          هاتف التواصل (يظهر في أسفل الموقع وزر واتساب)
        </label>
        <Input
          id="contactPhone"
          dir="ltr"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          aria-invalid={Boolean(fieldErrors.contactPhone)}
          placeholder="+212 654711474"
          required
        />
        {fieldErrors.contactPhone && (
          <p className="text-xs text-clay">{fieldErrors.contactPhone}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contactEmail" className="block text-sm font-medium">
          البريد الإلكتروني <span className="text-ink-muted">(اختياري — اتركه فارغاً لإخفائه)</span>
        </label>
        <Input
          id="contactEmail"
          dir="ltr"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          aria-invalid={Boolean(fieldErrors.contactEmail)}
          placeholder="contact@example.com"
        />
        {fieldErrors.contactEmail && (
          <p className="text-xs text-clay">{fieldErrors.contactEmail}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="address" className="block text-sm font-medium">
          العنوان
        </label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          aria-invalid={Boolean(fieldErrors.address)}
          required
        />
        {fieldErrors.address && (
          <p className="text-xs text-clay">{fieldErrors.address}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="orderAlertPhones" className="block text-sm font-medium">
          أرقام واتساب لتنبيهات الطلبات الجديدة
        </label>
        <p className="text-xs text-ink-muted">رقم واحد في كل سطر، مثال: +212654711474</p>
        <textarea
          id="orderAlertPhones"
          dir="ltr"
          rows={4}
          value={orderAlertPhonesText}
          onChange={(e) => setOrderAlertPhonesText(e.target.value)}
          className="flex w-full rounded-md border brass-hairline bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          placeholder={"+212654711474\n+212610755809"}
        />
      </div>

      <div className="flex items-start gap-3 rounded-lg border brass-hairline bg-surface p-4">
        <input
          id="sendCustomerWhatsApp"
          type="checkbox"
          checked={sendCustomerWhatsApp}
          onChange={(e) => setSendCustomerWhatsApp(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-brass"
        />
        <label htmlFor="sendCustomerWhatsApp" className="text-sm">
          <span className="font-medium">إرسال رسالة تأكيد واتساب للزبون بعد الطلب</span>
          <p className="text-ink-muted mt-0.5">
            عند الإلغاء، لن يصل أي واتساب للزبون — أرقام تنبيهات الطلبات أعلاه
            تستمر في التوصل بها كالمعتاد.
          </p>
        </label>
      </div>

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "جارٍ الحفظ…" : "حفظ الإعدادات"}
      </Button>
    </form>
  );
}
