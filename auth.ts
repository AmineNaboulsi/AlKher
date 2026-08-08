import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getAdminByEmail } from "@/lib/admins-repo";

/**
 * Origins a post-login redirect is allowed to land on.
 *
 * `localhost:3001` is here because that is the port `npm run dev` serves on —
 * without it, signing in locally fails the host check and the callback URL is
 * discarded. `SITE_URL` and `AUTH_URL` cover the deployed origins; anything
 * else is dropped back to the site root rather than followed, so a crafted
 * `?callbackUrl=` can't bounce an admin off to another host with their session
 * freshly established.
 */
const TRUSTED_ORIGINS = [
  "http://localhost:3001",
  process.env.SITE_URL,
  process.env.AUTH_URL,
  process.env.NEXTAUTH_URL,
]
  .filter((value): value is string => Boolean(value))
  .map((value) => {
    try {
      return new URL(value).origin;
    } catch {
      return null;
    }
  })
  .filter((origin): origin is string => origin !== null);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  // The app is served on a non-default port in development and behind a proxy
  // in production; either way the incoming Host header is the source of truth
  // for building callback URLs. Redirect targets are still checked against
  // TRUSTED_ORIGINS below, so trusting the host does not widen where a login
  // can send someone.
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const admin = await getAdminByEmail(email);
        if (!admin) return null;

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) return null;

        return { id: email, email, name: admin.name ?? email };
      },
    }),
  ],
  callbacks: {
    /**
     * Where a completed sign-in is allowed to send the browser.
     *
     * Relative paths ("/admin/products", which is what `proxy.ts` puts in
     * `callbackUrl`) are resolved against the current origin. Absolute URLs are
     * followed only when their origin is trusted; everything else falls back to
     * the site root.
     */
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();

      try {
        const target = new URL(url);
        const allowed = [baseUrl, ...TRUSTED_ORIGINS].map(
          (origin) => new URL(origin).origin
        );
        if (allowed.includes(target.origin)) return target.toString();
      } catch {
        // Not a URL we can parse — fall through to the safe default.
      }

      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) token.role = "admin";
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role as "admin";
      return session;
    },
  },
});
