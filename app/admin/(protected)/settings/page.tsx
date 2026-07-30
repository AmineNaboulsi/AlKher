import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings-repo";
import { SettingsForm } from "@/components/admin/settings-form";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "الإعدادات — الخير",
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">الإعدادات</h1>
        <p className="text-ink-muted mt-1">
          اسم المتجر، معلومات التواصل، وأرقام تنبيهات الطلبات — تظهر في كل
          الموقع وصفحات الإعلانات.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </>
  );
}
