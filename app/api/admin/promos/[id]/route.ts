import { auth } from "@/auth";
import { DatabaseNotConfiguredError } from "@/lib/mongodb";
import { getActiveProducts } from "@/lib/products-repo";
import {
  getPromoByIdForAdmin,
  updatePromo,
  isPromoIdTaken,
} from "@/lib/admin-promos-repo";
import { validatePromoInput } from "@/lib/admin-promos-validate";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/promos/[id]">
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "غير مصرح." }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const promo = await getPromoByIdForAdmin(id);
    if (!promo) {
      return Response.json({ error: "العرض غير موجود." }, { status: 404 });
    }
    return Response.json({ promo });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return Response.json({ error: "قاعدة البيانات غير مهيّأة." }, { status: 503 });
    }
    console.error("[admin/promos/:id] failed to load promo", error);
    return Response.json({ error: "تعذّر جلب العرض." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/promos/[id]">
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "غير مصرح." }, { status: 401 });
  }

  const { id: currentId } = await ctx.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null) {
    return Response.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;

  // Archive/unarchive-only toggle — skip full re-validation of the promo.
  if (Object.keys(body).length === 1 && typeof body.archived === "boolean") {
    try {
      const promo = await updatePromo(currentId, { archived: body.archived });
      if (!promo) {
        return Response.json({ error: "العرض غير موجود." }, { status: 404 });
      }
      return Response.json({ promo });
    } catch (error) {
      if (error instanceof DatabaseNotConfiguredError) {
        return Response.json({ error: "قاعدة البيانات غير مهيّأة." }, { status: 503 });
      }
      console.error("[admin/promos/:id] failed to toggle archive", error);
      return Response.json({ error: "تعذّر تحديث العرض." }, { status: 500 });
    }
  }

  try {
    const products = await getActiveProducts();
    const { fields, value } = validatePromoInput(body, products);
    if (!value) {
      return Response.json(
        { error: "المرجو تصحيح المعلومات التالية.", fields },
        { status: 400 }
      );
    }

    if (value.id !== currentId && (await isPromoIdTaken(value.id, currentId))) {
      return Response.json(
        {
          error: "المرجو تصحيح المعلومات التالية.",
          fields: { id: "هذا المعرّف مستخدم بالفعل." },
        },
        { status: 400 }
      );
    }

    const archived = typeof body.archived === "boolean" ? body.archived : undefined;
    const promo = await updatePromo(currentId, {
      ...value,
      ...(archived !== undefined ? { archived } : {}),
    });

    if (!promo) {
      return Response.json({ error: "العرض غير موجود." }, { status: 404 });
    }

    return Response.json({ promo });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return Response.json({ error: "قاعدة البيانات غير مهيّأة." }, { status: 503 });
    }
    console.error("[admin/promos/:id] failed to update promo", error);
    return Response.json({ error: "تعذّر تحديث العرض." }, { status: 500 });
  }
}
