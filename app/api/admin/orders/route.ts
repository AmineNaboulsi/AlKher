import { auth } from "@/auth";
import { DatabaseNotConfiguredError } from "@/lib/mongodb";
import { queryOrders } from "@/lib/admin-orders-repo";

export const runtime = "nodejs";

// Proxy (proxy.ts) already blocks unauthenticated requests to /api/admin/*,
// but Route Handlers should verify auth themselves too — see
// node_modules/next/dist/docs/.../guides/authentication.md#route-handlers.
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "غير مصرح." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const { orders, errors } = await queryOrders({
      status: searchParams.get("status"),
      city: searchParams.get("city"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      search: searchParams.get("search"),
    });

    if (Object.keys(errors).length > 0) {
      return Response.json(
        { error: "معطيات التصفية غير صحيحة.", fields: errors },
        { status: 400 }
      );
    }

    return Response.json({ orders });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return Response.json({ error: "قاعدة البيانات غير مهيّأة." }, { status: 503 });
    }
    console.error("[admin/orders] failed to fetch orders", error);
    return Response.json({ error: "تعذّر جلب الطلبات." }, { status: 500 });
  }
}
