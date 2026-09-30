# Design spec

BRAND_LOCK is `soft`. The run keeps the existing world in `DESIGN.md` (warm paper, grocery-green, marmalade, Young Serif / Hanken Grotesk / Fragment Mono) and repairs it. No new colours, no new fonts.

## Before screens

`.enhance/screens/before/`: `home-desktop`, `demo-desktop` (full page), `faq-desktop`, `home-mobile`, `login-mobile`. The app pages behind Google sign-in have no screenshots (see gap in `toolbox.md`).

Lighthouse (mobile, dev server), before: Accessibility 100, Best Practices 92, SEO 100 on `/` and `/faq`, 91 on `/login` (no meta description). Best Practices loses points for a console error: the Vercel Analytics debug script is blocked by the CSP in development. Lighthouse checks automated rules only. The manual failures in `AUDIT_REPORT.md` (AX-1 to AX-15) are not visible to it.

## References

The Mobbin MCP needs a paid plan, so references come from well-known public products. Each row takes one pattern and leaves the brand.

| Reference | Take | Ignore |
|---|---|---|
| Open Food Facts app, product page | Show "data missing" as a first-class state, not a zero. | Its crowded tab layout. |
| Yuka, scan result | One verdict line first, detail on tap. Cartwise already does this with watch/gap/win. | Its red/green score circle (a judgement Cartwise does not make). |
| Cronometer, nutrient targets | Meter capped at the target, overflow shown as text, not as a bar past 100%. | Its dense spreadsheet grid. |
| Wallet and bank-app receipts | Monospace figures in right-aligned columns. Already in the brand. | Card metaphors. |
| GOV.UK design system, destructive actions | Two-step confirm next to the control, with the object named in the button. | Full-page confirm screens. |
| GOV.UK error summary | An always-present live region that receives the error text. | Its blue link colour. |
| Linear / Vercel dashboards, nav | `aria-current` on the active item with a visible underline, not colour alone. | Sidebar layout. |

## Tokens (changes)

| Token | Light | Dark | Reason and ratio |
|---|---|---|---|
| `--ink-faint` | `#7a7059` → `#6d6450` | `#8d8672` → `#9a937e` | Light: 5.06:1 on paper, 4.59:1 on paper-2, 4.81:1 on surface-2. Dark: 4.93:1 on surface-2 (was 4.17:1). |
| `--field-border` (new) | `var(--ink-faint)` | `var(--ink-faint)` | Input borders reach 3:1 (1.4.11). Light 5.47:1 on surface. |
| `--unmatched-text` (new) | `var(--ink-soft)` | `var(--ink-soft)` | Chip text 7.6:1. `--unmatched` stays for the chip border and fill. |
| `--focus-on-dark` (new) | `var(--on-green)` | `var(--on-green)` | Focus ring on the green toast (11.07:1) and on the hero photo overlay. |
| `--scrim`, `--on-photo` (new) | replace the raw rgba values in the hero block | same | Restores the "no raw colour" rule. |
| `color-scheme` | `light` | `dark` | Native inputs, scrollbars and date pickers follow the theme. |

## Motion tokens

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 120ms | Hover colour, focus ring, chip press. |
| `--dur` | 200ms | Button background, skip link, disclosure. |
| `--dur-slow` | 320ms | Toast enter, meter fill. |
| `--ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | All entering motion. |

Every transition uses these. `@media (prefers-reduced-motion: reduce)` sets them to `0.01ms` and resets `html { scroll-behavior: auto }` (AX-14).

## Interaction states

| Element | Default | Hover | Focus-visible | Active | Disabled | Loading |
|---|---|---|---|---|---|---|
| `.button` primary | green fill | `--green-deep` | 2px `--accent-text` ring, 3px offset | translateY(1px) | opacity 0.5, `cursor: not-allowed` | label changes to "…ing" |
| `.button` ghost | outline | `--surface-2` fill | same ring | translateY(1px) | same | same |
| `.food-search-result` | row | `--surface-2` | same ring | `--paper-2` | opacity 0.5 (VD-4) | — |
| Chips (`.buy-again-chip`) | outline | `--surface-2` | same ring | translateY(1px) | opacity 0.5 (was 0.6) | — |
| App nav link | `--ink-soft` | `--ink` | same ring | — | — | current: `--ink`, 2px underline in `--green-text`, `aria-current="page"` |
| Anything on green or photo | — | — | ring in `--focus-on-dark` | — | — | — |

## Motion list

| Where | Property | Duration | Easing | Trigger | Kept? |
|---|---|---|---|---|---|
| Toast | opacity, translateY 8px→0 | `--dur-slow` | `--ease-out` | mount | yes (existing, tokenized) |
| Meter fill | width | `--dur-slow` | `--ease-out` | mount | yes |
| Button press | translateY 1px | `--dur-fast` | linear | `:active` | yes, new: gives press feedback |
| Nav current underline | none | — | — | — | no motion: position change needs no animation |
| Page transitions | — | — | — | — | rejected: adds nothing to a data app |
