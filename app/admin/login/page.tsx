import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "دخول المشرف — الخير",
};

async function authenticate(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") || "/admin");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(
        `/admin/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
    }
    throw error;
  }
}

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const { error, callbackUrl } = await searchParams;
  const resolvedCallbackUrl =
    typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/admin";

  const session = await auth();
  if (session?.user) redirect(resolvedCallbackUrl);

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-sm rounded-lg border brass-hairline bg-surface p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="font-display text-2xl font-bold">دخول المشرف</h1>
          <p className="text-sm text-ink-muted">لوحة تحكم الطلبات — الخير</p>
        </div>

        {error && (
          <p className="text-sm text-clay text-center">
            البريد الإلكتروني أو كلمة المرور غير صحيحة.
          </p>
        )}

        <form action={authenticate} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={resolvedCallbackUrl} />

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              البريد الإلكتروني
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              كلمة المرور
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full">
            دخول
          </Button>
        </form>
      </div>
    </div>
  );
}
