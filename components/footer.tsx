import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { SHOW_CATALOG } from "@/lib/site-config";

export function Footer() {
  return (
    <footer id="contact" className="border-t brass-hairline bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link
              href="/"
              className="font-display text-2xl font-bold text-ink hover:text-brass transition-colors"
            >
              الخير
            </Link>
            <p className="text-sm text-ink-muted leading-relaxed">
              علب الشاي الأخضر التي يعرفها البراد المغربي — بأسعار المحل،
              وبكرم الضيافة المغربية.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4">روابط</h3>
            <ul className="space-y-2 text-sm text-ink-muted">
              {SHOW_CATALOG && (
                <li>
                  <Link href="/shop" className="hover:text-ink transition-colors">
                    المتجر
                  </Link>
                </li>
              )}
              <li>
                <Link href="/#story" className="hover:text-ink transition-colors">
                  قصتنا
                </Link>
              </li>
              {SHOW_CATALOG && (
                <li>
                  <Link href="/cart" className="hover:text-ink transition-colors">
                    السلة
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4">تواصل</h3>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li dir="ltr" className="text-end sm:text-start">
              amiine.amiine123@gmail.com
              </li>
          
              <li dir="ltr" className="text-end sm:text-start">
                +212 654711474
              </li>
              <li>مراكش، المغرب</li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4">النشرة</h3>
            <p className="text-sm text-ink-muted mb-3">
              أخبار موسم الحصاد وعروض خاصة
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t brass-hairline flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-ink-muted">
          <p>© {new Date().getFullYear()} الخير. جميع الحقوق محفوظة.</p>
          <p>صُنع بكرم في المغرب 🇲🇦</p>
        </div>
      </div>
    </footer>
  );
}
