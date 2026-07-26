# Advanced Motion & 3D — the default direction

This is the **default** visual direction for this skill. `design-tokens.md` holds the lighter, calmer alternate — use that one only when the brief explicitly asks for light, minimal, editorial, or "simple". Everything else lands here.

The target is a flagship national brand launch: the kind of site a ministry of tourism or a heritage house commissions once and shows off for five years. Not a Shopify theme with a nicer font.

## Dark Majorelle palette

The light plaster palette in `design-tokens.md` inverted into night — the blue stops being an accent and becomes the room the site takes place in.

| Role | Color | Hex | Notes |
|---|---|---|---|
| Base | Midnight Majorelle | `#0B1233` | Deep, slightly violet navy. Not black, not slate. |
| Surface | Raised Majorelle | `#14204D` | Cards, sheets, header on scroll. |
| Signature | Majorelle blue | `#2B4FD8` | Brightened from the daylight `#1B3F94` so it survives on a dark field. Glow source. |
| Metal | Brass | `#B8892B` | Rules, borders, small caps, the teapot material. Carries the light. |
| Accent | Mint glow | `#3FBE84` | Sparingly — in stock, fresh badges, the tea itself. |
| Ink | Warm bone | `#F3ECE0` | Body text. Never pure white on this base. |
| Muted ink | | `#A3AECD` | Secondary copy, at least 4.5:1 on `#0B1233`. |

Brass is what makes this read as Moroccan rather than generic-tech-dark. A dark blue site with cyan accents is a SaaS dashboard; a dark blue site with brass hairlines and warm bone text is a riad at night. Keep the glow **blue and brass** — never purple/pink gradients.

## The four required techniques

Ship all four. Dropping to two makes it a nice site, not a flagship one.

### 1. Three.js hero object

A slowly rotating brass teapot — the Moroccan *berrad* with its long curved spout — as a real 3D object, lit so the brass carries specular highlights against the midnight field.

```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

Check peer ranges against the installed React before committing: `npm info @react-three/fiber peerDependencies`. React Three Fiber v9+ is the React 19 line; on React 19.2 an older v8 install will fail to reconcile.

Rules:
- The canvas component is `'use client'` and loaded with `next/dynamic` + `{ ssr: false }`. Three.js touches `window` on import and will break the server render otherwise.
- No `.glb` asset will exist unless the user supplies one. **Build the teapot from primitives** — lathe/torus/cylinder geometry for body, spout, handle, lid finial — with `meshStandardMaterial` at `metalness: 1, roughness: 0.25` and an environment map (`<Environment preset="night" />` from drei) so the brass has something to reflect. A procedurally-built teapot beats a downloaded model that isn't there.
- Motion is a slow constant Y rotation (roughly one revolution per 30s) plus a subtle mouse-parallax tilt. It must never look like a product configurator.
- Wrap in `<Suspense>` with a static fallback that occupies the same box, so nothing reflows on load.

### 2. Shader-backed atmosphere

One custom fragment shader, not decoration everywhere. Best target: a slow-drifting steam/vapour field rising behind the teapot, or a subtle noise-warped gradient in the hero's lower half where the blue meets the page. Simplex/value noise driven by `uTime`, output blended toward brass at the top of the plume. Keep it under the hero — a shader running behind the product grid is cost with no payoff.

### 3. Video-ready hero

The hero must accept a background video without redesign: a `<video autoPlay muted loop playsInline>` layer behind the 3D canvas, with a poster image and a gradient scrim so text contrast holds regardless of frame. When the user has no footage, ship the layer with the poster/gradient only and leave the `src` slot documented — do not fake it with a stock clip.

`playsInline` and `muted` are both mandatory or iOS refuses to autoplay.

### 4. 3D-tilt product cards

Pointer-tracked perspective tilt on `product-card`, ~8–10° maximum, with a brass specular sweep that follows the cursor and a shadow that deepens on hover.

- Transform on the card, `transform-style: preserve-3d`, `perspective` on the wrapper.
- Drive it with a `pointermove` listener writing to CSS custom properties and `requestAnimationFrame` — not a state update per pointer event, which will re-render the grid on every mouse move.
- **Pointer-fine only.** Gate with `@media (hover: hover) and (pointer: fine)`; on touch the card must be a plain, fast, tappable card.
- Tilt is a physical rotation, so it does **not** mirror under RTL — do not add a `rtl:` variant to the transform. The math is symmetric.

## Performance floor

Non-negotiable — these techniques are only worth it if the site stays fast:

- **60fps** on the hero on a mid-range laptop. Profile before delivering.
- **One WebGL context** for the whole page. Never a second `<Canvas>` for a second section.
- Cap `dpr` at `[1, 2]` on the canvas — uncapped DPR on a 3x phone screen is the single biggest frame-rate killer here.
- Pause rendering when the hero scrolls out of view (`frameloop="demand"` or an IntersectionObserver toggle) and when the tab is hidden.
- Three.js must be **dynamically imported**, never in the initial bundle. The shop, product, and cart pages ship zero WebGL.
- Hero LCP text renders from HTML immediately — it never waits on the canvas.

## Accessibility floor

- **`prefers-reduced-motion: reduce` disables all of it**: rotation stops on a composed frame, the shader freezes, card tilt is off, the video does not autoplay. The static state must look deliberate and finished, not broken.
- Every WebGL surface is decorative: `aria-hidden="true"`, not focusable. No information exists only inside the canvas.
- Contrast is measured against the *actual* rendered backdrop, including the video and the glow — a bone-on-Majorelle headline that passes over flat `#0B1233` can fail over a bright video frame. That's what the scrim is for.
- Focus states must be visible against the dark field: a brass ring, not the browser default blue on blue.

## Restraint

The signature move is the hero. Everything below it — the grid, filters, product detail, cart — is calm, fast, and conventional, with the zellige divider and brass hairlines as the only carried-through flourish. A site where every section fights for attention reads as a demo. The contrast between an extravagant hero and a disciplined store is what makes it read as designed.
