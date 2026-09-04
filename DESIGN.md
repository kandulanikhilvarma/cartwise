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

Nothing sets a raw colour or a magic pixel value at the component.

- **Ground** `--paper` #f4eee1 · `--paper-2` #ece3d1 · `--surface` #fbf7ee · `--surface-2` #f1e8d6
- **Ink** `--ink` #211c13 (14.6:1 on paper) · `--ink-soft` #564f3f (7.1:1) · `--ink-faint` #7a7059
- **Green** `--green` #1f4433 · `--green-deep` #163227 · `--on-green` #f4eede · `--green-text` #1f4433
- **Marmalade** `--accent` #bd6318 · `--accent-soft` #e0a25c · `--accent-text` #8f4a10
- **Signals** `--signal-win` #3d6b4f · `--signal-watch` #a2610f · `--signal-gap` #4a5a6b · `--unmatched` #8a8272 · `--danger` #a23a2a
- **Charting** `--viz-produce` #4f7a4a · `--viz-protein` #9a4b34 · `--viz-dairy` #c9973f · `--viz-grain` #8a6d3b · `--viz-pantry` #5c6b7a · `--viz-snack` #7a4a6b · `--viz-drink` #3f7480 — ordered by lightness so it survives greyscale.
- **Type scale** `--step--1` … `--step-4`, fluid, one ratio. **Space scale** `--s-1` … `--s-6` = 6 / 12 / 20 / 32 / 52 / 84.
- Radius 12 / 16 / 26px. Shadows carry offset + soft blur (never zero-offset halos).
- Dark mode: `@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme='light'])`, plus `:root[data-theme]` overrides so the toggle wins both ways.

**The one contrast rule.** Marmalade measures 3.66:1 on paper — fine for rules,
dots, step numerals and large type, below the 4.5:1 floor for anything set
small. Small text takes `--accent-text` instead. In dark mode the same token
resolves to #e0a25c at 7.50:1 and is used directly.

## Type

- **Display:** Young Serif (`--font-display`), weight 400, headings only, tracking
  -0.015em, `text-wrap: balance`. Deliberately not the Fraunces/Playfair defaults.
- **Body:** Hanken Grotesk (`--font-body`), weights 400/500/600/700, 17px base,
  1.55 line-height, measure ~66ch.
- **Figures:** Fragment Mono (`--font-mono`) with `font-variant-numeric: tabular-nums`
  on every number, weight, price, percentage and date. A receipt is set in a
  monospace; so is everything the app reports back.
- All three self-served via `next/font/google` in `src/app/layout.tsx`.

## Composition

- **Hero:** full-bleed produce plate, oversized serif headline and green primary
  CTA over a bottom-weighted gradient. No kicker above the heading.
- **Bands:** full-width sections separated by 1px rules, not stacked cards. Steps
  are an editorial numbered list beside a receipt photo.
- **The read:** three signal rows (watch / gap / win), each carrying a word as well
  as a colour, then meters against a week for the household.
- **Trust band:** green-drenched region (committed color at page scale) with a
  shopper photo — the one place the green owns the whole surface.
- Photography lives in `public/images/` (Unsplash, free license). One decisive
  photo per band; alt text describes the real subject.

## Motion

- OCR progress is a real percentage on a filling track — the one moment that
  reports actual work.
- Items settle in staggered as their matches resolve (`.stagger`, 6 steps then a
  shared delay). Toasts rise once. Meter fills ease on an exponential curve.
- `prefers-reduced-motion: reduce` disables animation and transitions globally.

## Reflexes

- No eyebrow/kicker above the hero heading; no hero-metric template; no gradient
  text; no glass-as-decoration; icons/marks are drawn or CSS, never emoji.
- States are real: hover, disabled, active, loading (OCR progress %, skeletons),
  error, empty, and **unmatched** — with `aria-live` on async status.
- Tone never rides on colour alone: every signal tag names itself, consumed items
  are struck through, unmatched items carry a labelled chip.
- Numbers never appear without their coverage. If only 11 of 12 items could be
  weighed, the page says so beside the total.
- Every interactive control names its action in the product's plain voice.

## Components

- `Button` / `buttonClass` own every button-shaped thing. Variant and size are
  props; a link or anchor takes the class string, because one component
  swallowing `<button>`, `<a>` and `<Link>` costs a polymorphic `as` prop that
  three call sites do not justify.
- `Icon` holds the icon set: a 20-unit box, `currentColor`, 1.7 stroke, round
  caps, `aria-hidden`. Every icon is decorative and the label belongs to
  whatever contains it.
- `src/app/globals.test.ts` fails the build if a static `className` names a rule
  that does not exist in `globals.css`. It only sees string literals, so
  template-literal class names still need eyes.

## Verified

Structure, image loads, console and the mechanical detector pass. The signed-out
`/demo` route renders the full read from a real receipt and is the fastest way to
review the system end to end without an account; it currently reads 12 of 12
against the live sources.

Two `transition: width` findings on `.progress-fill` and `.meter-fill` carry an
inline `impeccable-disable-next-line`. `transform: scaleX()` would stretch the
999px cap on the meter fill into an ellipse, and both are single small elements
inside `overflow: hidden` tracks, stepped by coarse callbacks rather than per
frame. The waiver is on the two lines, not on the rule.

A pixel-level side-by-side screenshot pass across every route, both themes,
still hasn't been run.
