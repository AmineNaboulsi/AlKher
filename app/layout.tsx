import type { Metadata } from "next";
import { Reem_Kufi, IBM_Plex_Sans_Arabic } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { ProductCatalogProvider } from "@/components/product-catalog-provider";
import { Header } from "@/components/header";
import { CartDrawer } from "@/components/cart-drawer";
import { SHOW_CATALOG } from "@/lib/site-config";
import { getActiveProducts, type ProductDocument } from "@/lib/products-repo";
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

export const metadata: Metadata = {
  title: "الخير — شاي أخضر للأتاي المغربي",
  description:
    "علب الشاي الأخضر الصيني التي يعرفها البراد المغربي: لاس بالماس، الساقية الحمراء، سمارة، وبيت الفخامة — بأسعار المحل.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let products: ProductDocument[] = [];
  if (SHOW_CATALOG) {
    try {
      products = await getActiveProducts();
    } catch (error) {
      // The site should still render (pre-launch pages, admin login, etc.)
      // even if the catalogue can't be loaded — cart/shop just show empty.
      console.error("[layout] failed to load product catalogue", error);
    }
  }

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${display.variable} ${body.variable} antialiased`}
    >
      <body className="min-h-dvh bg-background text-ink font-body">
        <ProductCatalogProvider products={products}>
          <CartProvider>
            <Header />
            {SHOW_CATALOG && <CartDrawer />}
            <main>{children}</main>
          </CartProvider>
        </ProductCatalogProvider>
      </body>
    </html>
  );
}
