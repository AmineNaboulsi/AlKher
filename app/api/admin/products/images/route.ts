import { auth } from "@/auth";
import { uploadProductImage, deleteProductImage } from "@/lib/product-images";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "غير مصرح." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "لم يتم إرفاق صورة." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: "صيغة الصورة غير مدعومة — jpeg, png أو webp فقط." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "حجم الصورة كبير جداً — الحد الأقصى 5 ميغابايت." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const id = await uploadProductImage(buffer, file.name, file.type);
    return Response.json({ id, url: `/api/images/${id}` }, { status: 201 });
  } catch (error) {
    console.error("[admin/products/images] upload failed", error);
    return Response.json({ error: "تعذّر رفع الصورة." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "غير مصرح." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "معرّف الصورة مفقود." }, { status: 400 });
  }

  await deleteProductImage(id);
  return new Response(null, { status: 204 });
}
