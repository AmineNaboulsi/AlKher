import { auth } from "@/auth";
import { DatabaseNotConfiguredError } from "@/lib/mongodb";
import { getSiteSettings, updateSiteSettings } from "@/lib/site-settings-repo";
import { validateSettingsInput } from "@/lib/admin-settings-validate";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "غير مصرح." }, { status: 401 });
  }

  const settings = await getSiteSettings();
  return Response.json({ settings });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "غير مصرح." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null) {
    return Response.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const { fields, value } = validateSettingsInput(payload as Record<string, unknown>);
  if (!value) {
    return Response.json(
      { error: "المرجو تصحيح المعلومات التالية.", fields },
      { status: 400 }
    );
  }

  try {
    const settings = await updateSiteSettings(value);
    return Response.json({ settings });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return Response.json({ error: "قاعدة البيانات غير مهيّأة." }, { status: 503 });
    }
    console.error("[admin/settings] failed to update settings", error);
    return Response.json({ error: "تعذّر حفظ الإعدادات." }, { status: 500 });
  }
}
