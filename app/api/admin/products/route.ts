import { auth } from "@/auth";
import { DatabaseNotConfiguredError } from "@/lib/mongodb";
import {
  queryProducts,
  createProduct,
  isSlugTaken,
} from "@/lib/admin-products-repo";
import { validateProductInput } from "@/lib/admin-products-validate";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "غير مصرح." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const { products, errors } = await queryProducts({
      search: searchParams.get("search"),
      category: searchParams.get("category"),
      status: searchParams.get("status"),
    });

    if (Object.keys(errors).length > 0) {
      return Response.json(
        { error: "معطيات التصفية غير صحيحة.", fields: errors },
        { status: 400 }
      );
    }

    return Response.json({ products });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return Response.json({ error: "قاعدة البيانات غير مهيّأة." }, { status: 503 });
    }
    console.error("[admin/products] failed to list products", error);
    return Response.json({ error: "تعذّر جلب المنتجات." }, { status: 500 });
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

  const { fields, value } = validateProductInput(payload as Record<string, unknown>);
  if (!value) {
    return Response.json(
      { error: "المرجو تصحيح المعلومات التالية.", fields },
      { status: 400 }
    );
  }

  try {
    if (await isSlugTaken(value.slug)) {
      return Response.json(
        {
          error: "المرجو تصحيح المعلومات التالية.",
          fields: { slug: "هذا المعرّف مستخدم بالفعل." },
        },
        { status: 400 }
      );
    }

    const product = await createProduct(value);
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return Response.json({ error: "قاعدة البيانات غير مهيّأة." }, { status: 503 });
    }
    console.error("[admin/products] failed to create product", error);
    return Response.json({ error: "تعذّر إنشاء المنتج." }, { status: 500 });
  }
}
