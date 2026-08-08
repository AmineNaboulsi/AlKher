import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  ALLOW_THEME_PREVIEW,
  LANDING_THEME,
  STORE_THEME,
} from "@/lib/site-config";
import {
  isTheme,
  surfaceOf,
  SURFACE_HEADER,
  THEME_COOKIE,
  THEME_HEADER,
  THEME_PARAM,
  type Surface,
  type Theme,
} from "@/lib/theme";

// NOTE: this file is intentionally named `proxy.ts`, not `middleware.ts` —
// the `middleware` file convention is deprecated in this Next.js version and
// renamed to `proxy` (see node_modules/next/dist/docs/.../file-conventions/proxy.md).

/** A year — the preview choice is a deliberate act, not a session detail. */
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Hands the resolved theme to the root layout through request headers.
 *
 * It has to travel this way: `data-theme` belongs on `<html>`, only the root
 * layout renders `<html>`, and the root layout cannot see the pathname — so
 * the one place that knows both the path and the cookie is here.
 */
function withTheme(
  request: Request,
  theme: Theme,
  surface: Surface
): NextResponse {
  const headers = new Headers(request.headers);
  headers.set(THEME_HEADER, theme);
  headers.set(SURFACE_HEADER, surface);
  return NextResponse.next({ request: { headers } });
}

export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl;

  /* ------------------------------------------------------------ admin gate */

  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminPage =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  if ((isAdminApi || isAdminPage) && !req.auth) {
    if (isAdminApi) {
      return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  /* ---------------------------------------------------------------- theme */

  const surface = surfaceOf(pathname);
  const configured = surface === "landing" ? LANDING_THEME : STORE_THEME;

  if (!ALLOW_THEME_PREVIEW) {
    return withTheme(req, configured, surface);
  }

  // `?theme=` is a one-shot instruction: persist it, then bounce to a clean URL
  // so the parameter doesn't end up shared, bookmarked or indexed. Anything
  // that isn't a known theme (`?theme=auto` is the documented spelling) clears
  // the override and returns the surface to its configured default.
  const requested = searchParams.get(THEME_PARAM);
  if (requested !== null) {
    const clean = new URL(req.nextUrl);
    clean.searchParams.delete(THEME_PARAM);

    const response = NextResponse.redirect(clean);
    if (isTheme(requested)) {
      response.cookies.set(THEME_COOKIE, requested, {
        path: "/",
        maxAge: THEME_COOKIE_MAX_AGE,
        sameSite: "lax",
      });
    } else {
      response.cookies.delete(THEME_COOKIE);
    }
    return response;
  }

  const override = req.cookies.get(THEME_COOKIE)?.value;
  return withTheme(req, isTheme(override) ? override : configured, surface);
});

export const config = {
  matcher: [
    // Admin surfaces — the auth gate.
    "/admin/:path*",
    "/api/admin/:path*",
    // Everything a visitor can see — theme resolution. Skips API routes, Next
    // internals and static files, none of which render `<html>`.
    "/((?!api/|_next/static|_next/image|media/|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|mp4|webm)$).*)",
  ],
};
