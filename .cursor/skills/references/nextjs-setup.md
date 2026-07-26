# Next.js Setup (App Router, RTL)

**Verify the version before writing code.** This file is written against **Next.js 16.2, React 19.2, Tailwind CSS v4**. Several things here are breaking changes from Next 14/15 — if `node_modules/next/dist/docs/` exists, it is the source of truth; read it rather than trusting habit.

```bash
cat package.json | grep -E '"next"|"react"|"tailwindcss"'
ls node_modules/next/dist/docs/01-app/02-guides/upgrading/
```

## Things that changed — do not write these from memory

| Habit from Next 14/15 | Next 16 reality |
|---|---|
| `params.slug` read synchronously | `params` and `searchParams` are **Promises**. `await` them. Sync access was removed, not deprecated. |
| `tailwind.config.ts` with `theme.extend` | Tailwind v4 has **no JS config**. Tokens live in `@theme` inside `globals.css`. |
| `middleware.ts` | Renamed to `proxy.ts`. |
| `experimental.ppr` | Replaced by top-level `cacheComponents: true`. |
| `next dev --turbo` | Turbopack is the **default**. The flag is gone; opt *out* with `--webpack`. |
| `images.domains` | Deprecated — use `images.remotePatterns`. |
| `next lint` | Removed. Run ESLint directly (`eslint`), flat config only. |
| Global `scroll-behavior: smooth` just working | Next no longer overrides it on navigation. Add `data-scroll-behavior="smooth"` to `<html>` if you want the old snap-to-top. |

## Scaffold

New project:

```bash
npx create-next-app@latest atay --typescript --tailwind --app --eslint
```

Existing project: skip this, work in the current tree.

## Root layout — the RTL foundation

`dir="rtl"` and `lang="ar"` go on `<html>` in `app/layout.tsx`. This is the single most important line in the project: it makes every logical property (`ps-`, `me-`, `text-start`) resolve correctly, so RTL is structural rather than a pile of overrides.

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Reem_Kufi, IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'

const display = Reem_Kufi({ subsets: ['arabic'], variable: '--font-display', display: 'swap' })
const body = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'أتاي — شاي مغربي أصيل',
  description: 'شاي أخضر ونعناع مغربي، مصدره جبال الريف والأطلس.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${display.variable} ${body.variable} antialiased`}>
      <body className="min-h-dvh bg-background text-ink font-body">{children}</body>
    </html>
  )
}
```

`metadata` must be Arabic too — a page titled "Create Next App" behind Arabic content is the tell of a rushed job.

## Tailwind v4 tokens

There is no `tailwind.config.ts`. Declare tokens in `app/globals.css`; each `--color-*` / `--font-*` entry generates the matching utilities (`bg-background`, `text-ink`, `font-display`).

```css
/* app/globals.css */
@import 'tailwindcss';

@theme {
  --color-background: #0B1233;
  --color-surface: #14204d;
  --color-ink: #F3ECE0;
  --color-majorelle: #2B4FD8;
  --color-brass: #B8892B;
  --color-mint: #2F6B4F;
  --color-clay: #B14328;

  --font-display: var(--font-display), system-ui, sans-serif;
  --font-body: var(--font-body), system-ui, sans-serif;
}
```

Use `@theme inline` instead when a token's value dereferences another CSS variable (the `next/font` variables above), so Tailwind emits the reference rather than the resolved value.

## RTL rules that actually bite

- **Logical properties only.** `ps-4`/`pe-4`, `ms-`/`me-`, `text-start`/`text-end`, `start-0`/`end-0`, `border-s`/`border-e`. Never `pl-`, `pr-`, `text-left`, `left-0` — those are physical and will not mirror.
- **Directional icons must flip.** Chevrons, arrows, "back", carousel controls, progress arrows: `className="rtl:-scale-x-100"`. A right-pointing "next" arrow in an RTL layout points backwards. Non-directional icons (cart, search, user) must **not** flip.
- **The cart drawer slides in from the left** in RTL — that's the trailing edge when reading right-to-left. shadcn `Sheet` takes `side="left"`.
- **Flexbox and grid mirror automatically** under `dir="rtl"`; do not "fix" them with `flex-row-reverse`. Reach for `flex-row-reverse` only when you want the order reversed *relative to* the reading direction.
- **Numerals stay Western.** See the SKILL.md non-negotiables. Do not apply a `font-feature-settings` or locale that swaps digits to Arabic-Indic unless asked.
- **Latin fragments inside Arabic** (a brand name, an email, `50g`) need `dir="ltr"` on an inline wrapper, or bidi reordering will scramble punctuation around them.

## shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add button card sheet select tabs accordion badge input separator
```

shadcn writes components into the repo — they are yours to edit, and you **must** edit them for RTL. Audit each added component for hardcoded `left`/`right`, `pl-`/`pr-`, and `translate-x` animations, and convert them to logical equivalents. `Sheet` and `Select` are the usual offenders: their open/close transforms are physically directional and will animate from the wrong edge.

## Dynamic routes — `params` is a Promise

The product detail page is the one place this bites. Run `npx next typegen` to get the global `PageProps` helper.

```tsx
// app/product/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { products } from '@/lib/products'

export default async function ProductPage({ params }: PageProps<'/product/[slug]'>) {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)
  if (!product) notFound()
  return <ProductDetail product={product} />
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}
```

Same for the shop page's filters: `const { category } = await searchParams`.

## Client/server split

Keep the split honest — it's what stops the whole store becoming one giant client bundle:

- **Server components** (default): pages, product data reads, static sections, `generateStaticParams`, metadata.
- **Client components** (`'use client'`): cart state/provider, quantity steppers, filter and sort controls, the cart drawer, anything with `useState` or an event handler, and every WebGL/Three.js component (see `advanced-motion-3d.md`).

Cart state lives in a client context provider mounted in the root layout, persisted to `localStorage`. Do not reach for a server-side cart or a database — the brief is a storefront, not a backend.

## Files

```
app/
  layout.tsx            # dir="rtl" lang="ar", fonts, cart provider
  page.tsx              # home
  globals.css           # @import 'tailwindcss' + @theme tokens
  shop/page.tsx         # listing + filters (searchParams)
  product/[slug]/page.tsx
  cart/page.tsx
  checkout/page.tsx     # stub — no payment processing
components/
  header.tsx  product-card.tsx  cart-drawer.tsx  zellige-divider.tsx  price.tsx
lib/
  products.ts  cart-context.tsx  utils.ts
```

## Before you call it done

```bash
npx tsc --noEmit && npm run build
```

A page that renders in dev but fails `next build` on an un-awaited `params` is the most common way this skill's output breaks.
