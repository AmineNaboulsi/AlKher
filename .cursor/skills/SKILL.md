---
name: moroccan-tea-storefront
description: Generates an advanced, modern, Arabic-language (RTL) Next.js e-commerce storefront for selling Moroccan tea, specialty tea, or similar artisanal/heritage food products — home page, shop/listing page, product detail page, and cart, built with Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui. Use this skill whenever the user asks to build, generate, redesign, or scaffold an e-commerce site, storefront, product pages, or shop UI in Arabic, mentions "متجر", "شاي مغربي", RTL layouts, or references a Moroccan/North African/Middle Eastern tea or artisanal goods business — even if they don't say "skill" or use the exact word "Next.js". Also use to add or restyle individual pieces (product cards, cart drawer, checkout flow) within an existing project of this kind.
---

# Moroccan Tea Storefront (Arabic RTL, Next.js)

Generates a distinctive, production-quality Arabic e-commerce experience for Moroccan tea (or adjacent artisanal/heritage goods). The output should never look like a generic AI storefront template — it should feel like it was designed by people who know the subject: mint tea rituals, brass teapots, zellige tiles, souks, the specific culture of Moroccan hospitality.

**The quality bar is a flagship national brand launch**, not a starter store. Default to the dark Majorelle direction with real WebGL, a Three.js hero object, video-ready hero, and 3D-tilt product cards — see `references/advanced-motion-3d.md`. If the result could pass for a Shopify theme, it isn't done.

Read `/mnt/skills/public/frontend-design/SKILL.md` first if available — this skill builds on it. The core discipline: brainstorm a token system, critique it against "does this look like any generic AI shop", revise, then build.

**Before writing any setup code, check the installed Next.js and Tailwind versions** (`package.json`, and `node_modules/next/dist/docs/` if present). Next 16 removed synchronous `params`, Tailwind v4 removed the JS config file — writing either from memory produces a store that renders in dev and fails the build. `references/nextjs-setup.md` lists the traps.

## Workflow

1. **Clarify scope** (only if genuinely ambiguous — otherwise assume the default). Default assumption: full store — Home, Shop/Listing, Product Detail, Cart — using Tailwind + shadcn/ui, App Router, TypeScript. Ask only about things that change structure significantly: real brand name/products vs. placeholder ("Atay" or similar), whether they have real product photos, and whether checkout/payment integration is in scope (default: cart only, checkout is a stubbed page/CTA, no real payment processing unless asked).
2. **Design brainstorm** — before writing code, produce a short token plan. Read `references/advanced-motion-3d.md` first: it defines the default dark Majorelle direction, the required 3D/video/shader techniques, and the performance floor. `references/design-tokens.md` holds the lighter alternate direction, only used if the brief explicitly asks for a light/minimal look. Do NOT default to generic cream+terracotta. State the plan in 4-6 lines: palette (named hexes), type pairing, layout concept, one signature element.
3. **Scaffold the project** per `references/nextjs-setup.md` (App Router structure, Arabic fonts via `next/font/google`, design tokens in Tailwind's `@theme` — there is no `tailwind.config.ts` in v4 — RTL setup, shadcn/ui install commands).
4. **Build the data model** per `references/product-model.md` — realistic Moroccan tea attributes (origin, blend, weight, brewing notes), not generic "product 1/2/3" filler.
5. **Build pages** per `references/pages.md` — Home, Shop, Product Detail, Cart — following the design plan from step 2.
6. **Self-critique** before presenting: RTL mirroring correct (icons/arrows flipped, not just text), numerals handled correctly (see below), responsive down to mobile, visible focus states, real Arabic copy (not lorem ipsum, not machine-translated-sounding).
7. **Deliver**: write real files, never a wall of code in chat. In a user's project, write into that project. In a sandboxed session with `/mnt/user-data/outputs`, write there and present the files per the environment's file-creation conventions. Then verify the build (`npx tsc --noEmit && npm run build`) before reporting done — a store that only renders in `next dev` is not delivered.

## Non-negotiables (apply every time)

- **`dir="rtl"` and `lang="ar"`** on `<html>` in the root layout. Mirror layout with Tailwind's logical properties (`ps-`, `pe-`, `ms-`, `me-`, `text-start`, `text-end`) instead of `pl-`/`pr-`/`text-left`, so RTL is structural, not a CSS hack.
- **Icons that imply direction** (chevrons, arrows, "back") must visually flip in RTL — either use a mirrored icon or `rtl:scale-x-[-1]` on the wrapper.
- **Numerals**: prices and quantities are conventionally rendered with Western digits (0-9) even inside Arabic text, unless the user asks for Arabic-Indic numerals (٠١٢٣...) — ask if unclear, default to Western digits since that's standard for e-commerce/pricing in the Maghreb.
- **Currency**: Moroccan dirham, displayed as `د.م.` after the number, e.g. `120 د.م.` — unless told otherwise.
- **Real Arabic copy**, written naturally (not transliterated English word order). If unsure of quality, keep sentences short and concrete rather than risk stilted phrasing.
- **Fonts must be Arabic-supporting** and loaded via `next/font/google` or self-hosted — see `references/design-tokens.md` for picks. Never ship a page where Arabic text silently falls back to a non-Arabic system font.
- **No payment processing code** unless explicitly requested — cart/checkout CTA can be a stub ("المتابعة إلى الدفع") that doesn't need to actually charge anyone.

## Test prompts

See `references/test-prompts.md` for example prompts used to validate this skill and what a good response looks like for each.