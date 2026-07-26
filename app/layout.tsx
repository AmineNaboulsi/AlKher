import type { Metadata } from "next";
import { Reem_Kufi, IBM_Plex_Sans_Arabic } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/header";
import { CartDrawer } from "@/components/cart-drawer";
import { SHOW_CATALOG } from "@/lib/site-config";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${display.variable} ${body.variable} antialiased`}
    >
      <body className="min-h-dvh bg-background text-ink font-body">
        <CartProvider>
          <Header />
          {SHOW_CATALOG && <CartDrawer />}
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
