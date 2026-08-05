# Design

<!-- impeccable:design-schema 1 -->

Cartwise's visual world, recorded from the shipped build. Market editorial:
a warm food-broadsheet look that refuses the cold blue-glass SaaS default.

## World

- **Register:** Persuade (marketing) + Operate (app), one warm system across both.
- **Ground:** warm paper/cream, never white. Light is the primary scene (phone in
  daylight after a shop); dark mode is a full parallel palette, not an inversion.
- **Color strategy:** Committed. One deep grocery-green owns whole regions (hero
  CTA, trust band, footer rules), marmalade is the single accent for labels,
  dots, and underlines. Never gray secondary text on colored fields — tint from
  the field's hue.

## Tokens (source of truth: `src/app/globals.css` `:root`)

- `--paper` #f4eee1 · `--paper-2` #ece3d1 · `--surface` #fbf7ee · `--surface-2` #f1e8d6
- `--ink` #211c13 · `--ink-soft` #564f3f · `--line` rgba(33,28,19,.16)
- `--green` #1f4433 · `--green-deep` #163227 · `--on-green` #f4eede · `--green-text` #1f4433
- `--accent` #bd6318 · `--accent-soft` #e0a25c · `--danger` #a23a2a
- Dark mode: `@media (prefers-color-scheme: dark)` + `:root[data-theme]` overrides.
- Radius 16 / 26px. Shadows carry offset + soft blur (never zero-offset halos).

## Type

- **Display:** Young Serif (`--font-display`), weight 400, headings only, tracking
  -0.015em, `text-wrap: balance`. Deliberately not the Fraunces/Playfair defaults.
- **Body:** Hanken Grotesk (`--font-body`), 17px base, 1.55 line-height, measure ~66ch.
- Both self-served via `next/font/google` in `src/app/layout.tsx`.

## Composition

- **Hero:** oversized serif headline + green primary CTA left; full-bleed produce
  plate (4:5) right with a receipt→items→nutrition caption chip.
- **Bands:** full-width sections separated by 1px rules, not stacked cards. Steps
  are an editorial numbered list beside a receipt photo. The nutrition "read" is a
  demonstrated sample card (labelled illustrative), not a claim.
- **Trust band:** green-drenched region (committed color at page scale) with a
  shopper photo — the one place the green owns the whole surface.
- Photography lives in `public/images/` (Unsplash, free license). One decisive
  photo per band; alt text describes the real subject.

## Motion

- One authored moment: the hero figure reveals via `clip-path` + fade
  (`figure-reveal`, exponential ease-out). Everything else is quiet.
- `prefers-reduced-motion: reduce` disables animation globally.

## Reflexes

- No eyebrow/kicker above the hero heading; no hero-metric template; no gradient
  text; no glass-as-decoration; icons/marks are drawn or CSS, never emoji.
- States are real: hover, disabled, active, loading (OCR progress %), error,
  empty ("no items / unmatched"), with `aria-live` on async status.
- Every interactive control names its action in the product's plain voice.

## Not yet reviewed

Pixel-level finish review (side-by-side screenshots) was not run: the in-app
browser pane could not composite frames this session. Structure, image loads,
console, and the mechanical detector were verified instead. A screenshot pass
remains worth doing before launch.
