import { NextResponse } from "next/server";
import { auth } from "@/auth";

// NOTE: this file is intentionally named `proxy.ts`, not `middleware.ts` —
// the `middleware` file convention is deprecated in this Next.js version and
// renamed to `proxy` (see node_modules/next/dist/docs/.../file-conventions/proxy.md).
export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminPage =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (!(isAdminApi || isAdminPage) || req.auth) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", req.nextUrl);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
