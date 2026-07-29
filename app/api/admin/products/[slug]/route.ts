import { auth } from "@/auth";
import { DatabaseNotConfiguredError } from "@/lib/mongodb";
import {
  getProductBySlugForAdmin,
  updateProduct,
  isSlugTaken,
} from "@/lib/admin-products-repo";
import { validateProductInput } from "@/lib/admin-products-validate";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/products/[slug]">
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "غير مصرح." }, { status: 401 });
  }

  const { slug } = await ctx.params;

  try {
    const product = await getProductBySlugForAdmin(slug);
    if (!product) {
      return Response.json({ error: "المنتج غير موجود." }, { status: 404 });
    }
    return Response.json({ product });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return Response.json({ error: "قاعدة البيانات غير مهيّأة." }, { status: 503 });
    }
    console.error("[admin/products/:slug] failed to load product", error);
    return Response.json({ error: "تعذّر جلب المنتج." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/products/[slug]">
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "غير مصرح." }, { status: 401 });
  }

  const { slug: currentSlug } = await ctx.params;

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

  // Archive/unarchive-only toggle — skip full re-validation of the product.
  if (Object.keys(body).length === 1 && typeof body.archived === "boolean") {
    try {
      const product = await updateProduct(currentSlug, { archived: body.archived });
      if (!product) {
        return Response.json({ error: "المنتج غير موجود." }, { status: 404 });
      }
      return Response.json({ product });
    } catch (error) {
      if (error instanceof DatabaseNotConfiguredError) {
        return Response.json({ error: "قاعدة البيانات غير مهيّأة." }, { status: 503 });
      }
      console.error("[admin/products/:slug] failed to toggle archive", error);
      return Response.json({ error: "تعذّر تحديث المنتج." }, { status: 500 });
    }
  }

  const { fields, value } = validateProductInput(body);
  if (!value) {
    return Response.json(
      { error: "المرجو تصحيح المعلومات التالية.", fields },
      { status: 400 }
    );
  }

  try {
    if (value.slug !== currentSlug && (await isSlugTaken(value.slug, currentSlug))) {
      return Response.json(
        {
          error: "المرجو تصحيح المعلومات التالية.",
          fields: { slug: "هذا المعرّف مستخدم بالفعل." },
        },
        { status: 400 }
      );
    }

    const archived = typeof body.archived === "boolean" ? body.archived : undefined;
    const product = await updateProduct(currentSlug, {
      ...value,
      ...(archived !== undefined ? { archived } : {}),
    });

    if (!product) {
      return Response.json({ error: "المنتج غير موجود." }, { status: 404 });
    }

    return Response.json({ product });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return Response.json({ error: "قاعدة البيانات غير مهيّأة." }, { status: 503 });
    }
    console.error("[admin/products/:slug] failed to update product", error);
    return Response.json({ error: "تعذّر تحديث المنتج." }, { status: 500 });
  }
}
