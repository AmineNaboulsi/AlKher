import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { getActiveProducts } from "@/lib/products-repo";
import { AD_LANDING_COPY } from "@/lib/ad-landing-copy";
import { DatabaseNotConfiguredError } from "@/lib/mongodb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "صفحات الإعلانات — الخير",
};

export default async function AdminLandingPagesPage() {
  let productBySlug = new Map<string, Awaited<ReturnType<typeof getActiveProducts>>[number]>();
  let loadError: string | null = null;

  try {
    const products = await getActiveProducts();
    productBySlug = new Map(products.map((p) => [p.slug, p]));
  } catch (error) {
    loadError =
      error instanceof DatabaseNotConfiguredError
        ? "قاعدة البيانات غير مهيّأة — راجع MONGODB_URI."
        : "تعذّر جلب المنتجات. حاول مرة أخرى.";
    console.error("[admin/landing-pages] failed to load products", error);
  }

  const entries = Object.entries(AD_LANDING_COPY);

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">صفحات الإعلانات</h1>
        <p className="text-ink-muted mt-1">
          صفحة مبيعات مستقلة لكل منتج، جاهزة لربطها بحملات الإعلانات — رابط
          واحد لكل منتج يجمع العرض والطلب في مكان واحد.
        </p>
      </div>

      {loadError && (
        <div className="rounded-lg border brass-hairline bg-surface p-8 text-center text-clay">
          {loadError}
        </div>
      )}

      {!loadError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {entries.map(([slug, copy]) => {
            const product = productBySlug.get(slug);
            return (
              <Card key={slug} className="overflow-hidden">
                <div className="relative aspect-[4/3] w-full bg-surface-raised">
                  <Image
                    src={copy.heroImage}
                    alt={product?.name ?? slug}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain"
                  />
                </div>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-lg truncate">
                      {product?.name ?? slug}
                    </CardTitle>
                    <p className="text-sm text-ink-muted mt-1" dir="ltr">
                      /lp/{slug}
                    </p>
                  </div>
                  {!product && <Badge variant="clay">المنتج غير موجود</Badge>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-ink-muted line-clamp-2">
                    {copy.headline}
                  </p>
                  <Link
                    href={`/lp/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-sm text-majorelle hover:underline"
                  >
                    فتح الصفحة
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
