import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Reem_Kufi, IBM_Plex_Sans_Arabic } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { ProductCatalogProvider } from "@/components/product-catalog-provider";
import { SiteSettingsProvider } from "@/components/site-settings-provider";
import { Header } from "@/components/header";
import { CartDrawer } from "@/components/cart-drawer";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  ALLOW_THEME_PREVIEW,
  LANDING_THEME,
  SHOW_CATALOG,
  STORE_THEME,
} from "@/lib/site-config";
import {
  isTheme,
  SURFACE_HEADER,
  THEME_HEADER,
  type Surface,
} from "@/lib/theme";
import { getActiveProducts, type ProductDocument } from "@/lib/products-repo";
import { getActivePromos, type PromoDocument } from "@/lib/promos-repo";
import { getSiteSettings } from "@/lib/site-settings-repo";
import "./globals.css";

const display = Reem_Kufi({
  subsets: ["arabic"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.storeName} — شاي أخضر للأتاي المغربي`,
    description:
      "علب الشاي الأخضر الصيني التي يعرفها البراد المغربي: لاس بالماس، الساقية الحمراء، سمارة، وبيت الفخامة — بأسعار المحل.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolved in `proxy.ts`, which is the only place that knows both the
  // pathname (store or landing page) and the preview cookie. Reading a header
  // here makes every page dynamic — an acceptable trade for a theme the
  // visitor can actually be switched between, and the catalogue pages already
  // hit the database on each request anyway.
  const requestHeaders = await headers();
  const resolved = requestHeaders.get(THEME_HEADER);
  const surface: Surface =
    requestHeaders.get(SURFACE_HEADER) === "landing" ? "landing" : "store";
  const theme = isTheme(resolved)
    ? resolved
    : surface === "landing"
      ? LANDING_THEME
      : STORE_THEME;

  let products: ProductDocument[] = [];
  let promos: PromoDocument[] = [];
  if (SHOW_CATALOG) {
    try {
      [products, promos] = await Promise.all([
        getActiveProducts(),
        getActivePromos(),
      ]);
    } catch (error) {
      // The site should still render (pre-launch pages, admin login, etc.)
      // even if the catalogue can't be loaded — cart/shop just show empty.
      console.error("[layout] failed to load product catalogue", error);
    }
  }
  const settings = await getSiteSettings();

  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme={theme}
      className={`${display.variable} ${body.variable} antialiased`}
    >
      <body className="min-h-dvh bg-background text-ink font-body">
        <ThemeProvider theme={theme}>
          <SiteSettingsProvider settings={settings}>
            <ProductCatalogProvider products={products} promos={promos}>
              <CartProvider>
                <Header />
                {SHOW_CATALOG && <CartDrawer />}
                <main>{children}</main>
                {ALLOW_THEME_PREVIEW && (
                  <Suspense>
                    <ThemeSwitcher
                      theme={theme}
                      surface={surface}
                      configured={
                        surface === "landing" ? LANDING_THEME : STORE_THEME
                      }
                    />
                  </Suspense>
                )}
              </CartProvider>
            </ProductCatalogProvider>
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
