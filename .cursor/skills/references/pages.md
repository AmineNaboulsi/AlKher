# Pages

Structure only — the visual direction comes from `advanced-motion-3d.md` (default) or `design-tokens.md` (light/minimal briefs). The hero in particular is defined there, not here.

## Home (`app/page.tsx`)

1. **Header** — logo/wordmark (Arabic, display font), nav (المتجر / قصتنا / تواصل), cart icon with item-count badge, opens `cart-drawer` on click.
2. **Hero** — the signature moment (see design-tokens.md layout concept). Real Arabic headline about ritual/hospitality, one supporting line, one primary CTA ("تسوق الآن") pointing to `/shop`.
3. **Category strip** — quick links into `/shop?category=...` for the main tea categories, styled as more than plain text links (small icon or texture per category).
4. **Featured products** — 3-4 `product-card` components pulling from `lib/products.ts`.
5. **Story/heritage section** — short real copy about sourcing/tradition, paired with the zellige-divider motif as a section break above or below it.
6. **Footer** — contact, socials, simple newsletter input (non-functional stub is fine), copyright.

## Shop / Listing (`app/shop/page.tsx`)

- Filter sidebar (or a filter bar on mobile): category, price range, in-stock only. Use shadcn `Select`/checkboxes.
- Sort control: الأحدث / السعر: من الأقل / السعر: من الأعلى / الأعلى تقييماً.
- Responsive grid of `product-card`s (2 cols mobile, 3-4 desktop).
- Empty state if filters return nothing: clear message + a way to reset filters, in the interface's voice ("لا توجد نتائج مطابقة — جرّب تعديل الفلاتر").

## Product Detail (`app/product/[slug]/page.tsx`)

- Image gallery (left or right depending on RTL flow — in RTL, convention is gallery on the right, details on the left, but confirm this reads naturally; a stacked layout on mobile).
- Product name, rating, short description.
- Variant selector (weight) — updates price live.
- Quantity stepper + "أضف إلى السلة" primary CTA.
- Tabs or accordion: الوصف (description) / نكهة وملاحظات (flavor notes) / طريقة التحضير (brewing, using the `brewing` fields — temp, steep time, notes) / التقييمات (reviews, can be a simple static list).
- Related products strip at the bottom.

## Cart (`app/cart/page.tsx` and/or `cart-drawer.tsx`)

- Drawer (shadcn `Sheet`, slides in from the **left** in RTL) for quick access from any page; a full `/cart` page for a complete view.
- Line items: image thumbnail, name, variant (weight), quantity stepper, per-item subtotal, remove button.
- Order summary: subtotal, shipping (flat rate or "يُحسب عند الدفع" stub), total.
- Primary CTA: "المتابعة إلى الدفع" — can route to a stub `/checkout` page that says checkout isn't wired to a real payment processor yet, unless the user asked for real payment integration.
- Empty cart state with a CTA back to `/shop`.

## Shared components worth extracting

- `product-card.tsx` — image, name, category badge, price range or single price, hover lift, "أضف إلى السلة" quick-add button.
- `zellige-divider.tsx` — inline SVG geometric pattern, used as the signature section break.
- `price.tsx` — small component that formats `{amount} د.م.` consistently so Western-digit formatting stays centralized.