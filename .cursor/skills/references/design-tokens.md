# Design Tokens — Moroccan Tea Storefront

Don't reuse this palette blindly on every project — treat it as an anchor and starting point, then adapt to the specific brand brief (name, mood, existing branding if any). The point is to avoid the generic AI-shop look (cream background + terracotta accent + generic sans-serif) by grounding choices in things that are actually specific to Morocco and to tea culture, not just "warm and earthy."

## Anchor palette (adapt, don't copy-paste unchanged)

| Role | Color | Hex | Why |
|---|---|---|---|
| Primary / signature | Majorelle blue | `#1B3F94` (deepen/lighten to taste) | The single most Marrakech-specific color there is (Jardin Majorelle) — distinctive, not a generic "earthy" default |
| Secondary | Brass / antique gold | `#B8892B` | Teapots, trays, the metal the tea is served from |
| Tertiary accent | Deep mint | `#2F6B4F` | The tea itself — use sparingly, e.g. on tags, "in stock," fresh/new badges |
| Background (light mode) | Warm plaster / bone | `#F3ECE0` | Zellige grout / tadelakt plaster tone — warmer and more specific than flat cream |
| Ink / text | Near-black warm charcoal | `#211C16` | Not pure black — keep it warm to match the plaster undertone |
| Danger/error | Clay red | `#B14328` | Reserve for actual errors, not decoration |

Take one real risk: e.g. a zellige-inspired geometric border/divider motif as the signature element (rendered in CSS/SVG, not a stock image), or a full-bleed Majorelle-blue section break between hero and product grid. Pick ONE signature move, keep everything else disciplined.

## Typography

Pair a characterful Arabic display face with a clean, highly-legible Arabic body face — don't use the same weight of the same font for both.

- **Display** (headlines, hero, section titles): `Reem Kufi` (geometric Kufic-inspired, modern and distinctive — avoid the more expected `Amiri`/calligraphic unless the brief specifically wants a heritage-calligraphy mood) or `El Messiri` (has real personality, works well at large sizes).
- **Body** (paragraphs, product descriptions, UI labels): `IBM Plex Sans Arabic` or `Tajawal` — both are highly legible at small sizes and have good weight ranges.
- **Numerals/prices**: whatever body font is chosen, confirm it has full Latin digit support (all of the above do) since prices render in Western digits by default (see SKILL.md non-negotiables).

Load via `next/font/google` in `app/layout.tsx`. **`weight` is required only for non-variable fonts** — passing it for a variable font pins it to static cuts and wastes the variable axis:

| Font | Variable? | `weight` |
|---|---|---|
| `Reem_Kufi` | yes | omit |
| `El_Messiri` | yes | omit |
| `IBM_Plex_Sans_Arabic` | **no** | required, e.g. `['400','500','600','700']` |
| `Tajawal` | **no** | required, e.g. `['400','500','700']` |

```ts
import { Reem_Kufi, IBM_Plex_Sans_Arabic } from 'next/font/google'

// Variable font — no weight.
const display = Reem_Kufi({ subsets: ['arabic'], variable: '--font-display', display: 'swap' })

// Static font — weight is mandatory; omitting it throws at build time.
const body = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})
```

Every font above ships an `arabic` subset — always pass `subsets: ['arabic']`, or Arabic glyphs fall back to a system font and the page silently loses its typography. Expose the variables to Tailwind v4 via `@theme inline` in `globals.css` (see `nextjs-setup.md`), not a `tailwind.config.ts` — that file doesn't exist in Tailwind v4.

## Layout concept

- Hero should open with the most characteristic thing in this world — not a generic "Shop Now" banner. Options: an interactive/animated pour of tea into a glass, a close-up of mint leaves with a headline about ritual/hospitality, or a short line of real Moroccan hospitality culture ("الشاي عندنا مش مشروب... هو ترحيب" / "Tea, for us, isn't a drink — it's a welcome") set in the display face over a Majorelle-blue field.
- Avoid numbered step markers (01/02/03) unless there's a real sequence (e.g. actual brewing steps — that's legitimate).
- Use a geometric divider/pattern (zellige-inspired repeating motif, done in inline SVG so it stays crisp) as a section break instead of a plain `<hr>` — this can be the signature element.

## Motion

- Subtle only: hover states on product cards (slight lift + shadow), a smooth cart-drawer slide-in from the correct RTL side (from the left, since content flow is right-to-left), maybe a single orchestrated hero entrance (fade+rise). Avoid scattering animation everywhere — pick 1-2 moments that matter and keep the rest calm.