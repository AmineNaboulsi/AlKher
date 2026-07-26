# Test Prompts

Used to sanity-check the skill during drafting/iteration. Not exhaustive — add more once the user sees real output and gives feedback.

Each test names the path through `SKILL.md` it exercises, so a failure points at a specific file rather than "the skill is bad".

---

## Test 1 — Full store, cold start

**Prompt:** "أنشئ لي موقع Next.js متجر إلكتروني لبيع أتاي مغربي، تصميم عصري ومتقدم"
("Build me a Next.js e-commerce site for selling Moroccan tea, modern and advanced design")

*Path: full workflow, steps 1–7, default dark Majorelle direction.*

Good output should:

- Produce a design token brainstorm before code (visible in Claude's response, not skipped)
- Scaffold Home, Shop, Product Detail, Cart
- Use real Arabic copy and a real-feeling product catalog (not "Product 1")
- Correctly set `dir="rtl"`/`lang="ar"`, logical Tailwind properties, Western-digit prices with `د.م.`
- Not default to cream+terracotta — should show a deliberate, subject-specific palette

Also watch for:

- **Not asking a pile of clarifying questions.** "تصميم عصري ومتقدم" is not ambiguous; step 1 says assume the default. One question about real brand/products is acceptable, an interview is a failure.
- All four techniques from `advanced-motion-3d.md` present — Three.js hero object, shader atmosphere, video-ready hero layer, 3D-tilt cards. Two out of four is the most likely partial failure.
- Files written to disk, not pasted into chat.

Fails if: the response opens with code before any token plan; the palette is cream/terracotta/beige; the hero is a stock "Shop Now" banner.

---

## Test 2 — Version discipline

**Prompt:** same as Test 1, in a repo running Next.js 16 + Tailwind v4.

*Path: `nextjs-setup.md`.*

Good output should:

- Read the installed version before writing setup code
- `await params` in `app/product/[slug]/page.tsx`
- Put tokens in `@theme` in `globals.css` — **no `tailwind.config.ts`**
- Pass `weight` to `IBM_Plex_Sans_Arabic` (static) and omit it for `Reem_Kufi` (variable)
- Survive `npx tsc --noEmit && npm run build`

Fails if: `params.slug` is read synchronously; a `tailwind.config.ts` appears; `next dev --turbo` is suggested.

This is the highest-value regression test — it's the failure mode where everything looks right and nothing builds.

---

## Test 3 — Light direction override

**Prompt:** "بغيت متجر شاي بتصميم بسيط وفاتح، بلا مؤثرات كثيرة"
("I want a tea shop with a simple, light design, without many effects")

*Path: step 2 branch to `design-tokens.md` instead of `advanced-motion-3d.md`.*

Good output should:

- Use the warm plaster / Majorelle daylight palette, not the dark direction
- Skip Three.js and the shader entirely — no WebGL in the bundle
- Still deliver a signature element (the zellige divider), still real Arabic copy, still correct RTL

Fails if: it ships the dark WebGL hero anyway. The default is a default, not a mandate — an explicit brief overrides it.

---

## Test 4 — Single component, existing project

**Prompt:** "زيد لي cart drawer فهاد المشروع"
("Add a cart drawer to this project")

*Path: the "add or restyle individual pieces" clause in the description.*

Good output should:

- Read the existing project's tokens and match them — not impose the skill's palette on someone else's site
- Slide in from the **left** (trailing edge in RTL)
- Add only the drawer and its state wiring; not scaffold four pages nobody asked for
- Audit the shadcn `Sheet` it generates for hardcoded `left`/`right` transforms

Fails if: it rebuilds the store, or the drawer flies in from the right.

---

## Test 5 — Adjacent product, not tea

**Prompt:** "متجر لبيع الأركان والزيوت المغربية التقليدية"
("A shop for argan oil and traditional Moroccan oils")

*Path: the "or adjacent artisanal/heritage goods" scope.*

Good output should:

- Adapt the product model — argan needs origin region, extraction method, cosmetic vs. culinary, volume in ml, not `steepMinutes`
- Adapt the palette away from the tea-specific mint accent toward something argan-specific, while keeping the Majorelle/brass anchor
- Not leave brewing tabs on a bottle of oil

Fails if: `brewing` survives into the data model, or the copy still talks about النعناع. This is the test for whether the references are being *adapted* or *copy-pasted*.

---

## Test 6 — Real brand, real products

**Prompt:** user supplies a brand name, 6 real products with photos, and asks for a store.

*Path: step 1 clarification + the "replace this seed data entirely" rule in `product-model.md`.*

Good output should:

- Replace the seed catalog wholesale — no `أتاي بالنعناع` sample product left sitting alongside the user's real ones
- Use the supplied photos via `next/image` with real `alt` text in Arabic
- Derive the palette from the user's branding if they have any, using the anchor palette only where they don't

Fails if: sample products are layered underneath the real ones, or placeholder images remain in the grid.

---

## Test 7 — Checkout scope boundary

**Prompt:** "المتجر خاصو يقبل الأداء بالبطاقة"
("The store needs to accept card payments")

*Path: the no-payment-processing non-negotiable, explicitly overridden.*

Good output should:

- Treat this as the explicit request that lifts the default, and say so
- Ask which processor before writing integration code — this is a genuine structural fork
- Never invent API keys, and never write code that appears to charge someone but doesn't

Fails if: it refuses on the basis of the non-negotiable. The rule is "not unless asked" — this is being asked.

---

## Cross-cutting checks (run against every test)

- **Bidi:** a Latin fragment inside an Arabic sentence (brand name, `50g`, an email) is wrapped `dir="ltr"` and doesn't scramble surrounding punctuation.
- **Digits:** prices are `120 د.م.`, Western digits, currency after the number.
- **Directional icons flip; non-directional icons don't.** A flipped cart or search icon is as wrong as an unflipped chevron.
- **Reduced motion:** `prefers-reduced-motion: reduce` produces a finished-looking static page, not a broken one.
- **Mobile:** usable at 375px. The 3D tilt is off on touch.
- **Focus:** visible focus rings that survive the dark background.
- **Copy:** reads as written-in-Arabic, not translated-from-English word order. Short and concrete beats ambitious and stilted.
