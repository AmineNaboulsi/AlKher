import { auth } from "@/auth";
import { DatabaseNotConfiguredError } from "@/lib/mongodb";
import { getActiveProducts } from "@/lib/products-repo";
import { queryPromos, createPromo, isPromoIdTaken } from "@/lib/admin-promos-repo";
import { validatePromoInput } from "@/lib/admin-promos-validate";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "غير مصرح." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const { promos, errors } = await queryPromos({
      search: searchParams.get("search"),
      status: searchParams.get("status"),
    });

    if (Object.keys(errors).length > 0) {
      return Response.json(
        { error: "معطيات التصفية غير صحيحة.", fields: errors },
        { status: 400 }
      );
    }

    return Response.json({ promos });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return Response.json({ error: "قاعدة البيانات غير مهيّأة." }, { status: 503 });
    }
    console.error("[admin/promos] failed to list promos", error);
    return Response.json({ error: "تعذّر جلب العروض." }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

  try {
    const products = await getActiveProducts();
    const { fields, value } = validatePromoInput(
      payload as Record<string, unknown>,
      products
    );
    if (!value) {
      return Response.json(
        { error: "المرجو تصحيح المعلومات التالية.", fields },
        { status: 400 }
      );
    }

    if (await isPromoIdTaken(value.id)) {
      return Response.json(
        {
          error: "المرجو تصحيح المعلومات التالية.",
          fields: { id: "هذا المعرّف مستخدم بالفعل." },
        },
        { status: 400 }
      );
    }

    const promo = await createPromo(value);
    return Response.json({ promo }, { status: 201 });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return Response.json({ error: "قاعدة البيانات غير مهيّأة." }, { status: 503 });
    }
    console.error("[admin/promos] failed to create promo", error);
    return Response.json({ error: "تعذّر إنشاء العرض." }, { status: 500 });
  }
}
