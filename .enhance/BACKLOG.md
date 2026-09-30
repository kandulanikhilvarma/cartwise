# Backlog

Score = Impact (1-5) × Confidence (1-5) ÷ Effort (1-5). Order: P0, then P1, then score. Every changed line traces to an ID here. Details and evidence are in `AUDIT_REPORT.md`.

Status: TODO, DONE (with evidence), PARKED (blocker ID), REJECTED (reason).

## Fixes

| ID | Sev | I | C | E | Score | Group | Status |
|---|---|---|---|---|---|---|---|
| S-1 | P0 | 5 | 5 | 1 | 25 | deps | DONE `8d0f897`: prod audit 6 → 0, 57 tests, build green |
| S-10 | P1 | 4 | 5 | 1 | 20 | deps | DONE `8d0f897` |
| S-2 | P1 | 4 | 5 | 1 | 20 | api | DONE `430105b`: `/api/health` → `{"ok":false,"db":"error"}` 503, no host in body |
| C-14 | P1 | 5 | 5 | 1 | 25 | api | DONE `1d1df16`: `barcode.test.ts`; unknown code → 404, no invented product |
| C-15 | P1 | 4 | 5 | 1 | 20 | api | DONE `1d1df16`: 6 s timeout; `/api/food-db/barcode/123` → 400 |
| C-2 | P1 | 5 | 5 | 1 | 25 | parser | DONE `7e8e27f`: `receipt-layouts.test.ts` |
| C-3 | P1 | 4 | 5 | 1 | 20 | parser | DONE `7e8e27f`: `receipt-layouts.test.ts` |
| C-1 | P1 | 5 | 4 | 2 | 10 | parser | DONE `7e8e27f`: `receipt-layouts.test.ts`; `/demo` still reads 12 lines |
| T-1 | P1 | 4 | 5 | 2 | 10 | tests | DONE across the fix commits: 57 → 83 tests, 4 → 10 files |
| UX-1 | P1 | 5 | 5 | 1 | 25 | client | DONE `54a9194`: two-step delete, named buttons; tsc, lint (UI behind sign-in not seen: B-1) |
| C-11 | P1 | 4 | 4 | 2 | 8 | client | DONE `06fc4e6`: tsc, lint (UI behind sign-in not seen: B-1) |
| PF-1 | P1 | 4 | 4 | 2 | 8 | perf | DONE `15c56ea`: build static routes 5 → 13; marketing pages `○` |
| AX-2 | P1 | 4 | 5 | 1 | 20 | css | DONE `e1caf64`: field border 1.95:1 → 5.47:1 |
| AX-3 | P1 | 3 | 5 | 1 | 15 | css | DONE `e1caf64`: chip text 3.3:1 → 7.6:1 |
| AX-4 | P1 | 4 | 4 | 1 | 16 | css | DONE `e1caf64`: ring on dark green about 2:1 → 11:1 |
| AX-7 | P1 | 4 | 5 | 2 | 10 | a11y | DONE `15c56ea`: skip link and `<main id="main">` seen on 8 pages; Lighthouse a11y 100 |
| AX-8 | P1 | 3 | 5 | 1 | 15 | a11y | DONE `54a9194`, `c5833ed`, `0648ee5`: always-mounted alert regions (UI behind sign-in not seen: B-1) |
| AX-1 | P1 | 4 | 4 | 3 | 5.3 | a11y | DONE `27defa7`: four trim sliders; tsc, class-guard test (UI behind sign-in not seen: B-1) |
| SEO-1 | P1 | 4 | 5 | 1 | 20 | seo | DONE `15c56ea`: prod HTML has per-page title, description, canonical in `<head>` |
| S-3 | P2 | 3 | 5 | 1 | 15 | api | DONE `897eee9`: fixed copy plus digest |
| S-4 | P2 | 3 | 5 | 1 | 15 | api | DONE `4d1c73d`: tsc; per-field checks |
| S-5 | P2 | 3 | 5 | 1 | 15 | api | DONE `1d1df16`: code checked 8-14 digits; 400 seen |
| S-6 | P2 | 3 | 5 | 1 | 15 | store | DONE `4c52e52`: `batch-store.test.ts` |
| S-7 | P2 | 3 | 4 | 1 | 12 | api | DONE `98d6a21`: `rate-limit.test.ts` |
| R-1 | P2 | 2 | 5 | 1 | 10 | api | DONE `430105b` (with S-2) |
| C-4 | P2 | 3 | 5 | 1 | 15 | parser | DONE `7e8e27f`: `receipt-layouts.test.ts` |
| C-6 | P2 | 4 | 5 | 1 | 20 | parser | DONE `7e8e27f`: `receipt-layouts.test.ts` |
| C-7 | P2 | 3 | 5 | 1 | 15 | parser | DONE `7e8e27f`, `54a9194`, `c5833ed`: UTC dates; parser test |
| C-5 | P2 | 3 | 4 | 2 | 6 | parser | DONE `7e8e27f`: `receipt-layouts.test.ts` |
| C-8 | P2 | 4 | 5 | 1 | 20 | insights | DONE `2150bc9`: `batch-honesty.test.ts` |
| C-9 | P2 | 3 | 5 | 1 | 15 | insights | DONE `2150bc9`: `batch-honesty.test.ts` |
| C-10 | P2 | 3 | 5 | 1 | 15 | insights | DONE `2150bc9`: `history.test.ts` |
| C-12 | P2 | 3 | 4 | 1 | 12 | client | DONE `06fc4e6`: tsc, lint (UI behind sign-in not seen: B-1) |
| C-13 | P2 | 3 | 5 | 1 | 15 | client | DONE `06fc4e6`, `bb9b91f`: tsc, lint (UI behind sign-in not seen: B-1) |
| UX-3 | P2 | 3 | 5 | 1 | 15 | client | DONE `0648ee5`: server reason shown; 400 message seen |
| UX-4 | P2 | 3 | 5 | 1 | 15 | client | DONE `9172341`: `/login?error=AccessDenied` shows alert |
| UX-5 | P2 | 3 | 5 | 1 | 15 | client | DONE `bb9b91f`: tsc, lint (UI behind sign-in not seen: B-1) |
| UX-6 | P2 | 2 | 5 | 1 | 10 | client | DONE `06fc4e6`: empty state (UI behind sign-in not seen: B-1) |
| UX-2 | P2 | 4 | 5 | 2 | 10 | feature | DONE as N-1 (`4afc566`, `0648ee5`) (UI behind sign-in not seen: B-1) |
| PF-2 | P2 | 3 | 5 | 1 | 15 | perf | DONE `605af6c`: build makes 0 prisma calls (was 12) |
| AX-5 | P2 | 3 | 5 | 1 | 15 | css | DONE `e1caf64`: toast Undo uses `--on-green` |
| AX-6 | P2 | 3 | 5 | 1 | 15 | css | DONE `e1caf64`: `--ink-faint` 5.06:1 light, 4.93:1 dark |
| AX-9 | P2 | 3 | 4 | 1 | 12 | a11y | DONE `06fc4e6`, `bb9b91f` (UI behind sign-in not seen: B-1) |
| AX-10 | P2 | 2 | 5 | 1 | 10 | a11y | DONE `e1caf64`: clamp |
| AX-11 | P2 | 3 | 5 | 1 | 15 | a11y | DONE `54a9194`, `06fc4e6` (UI behind sign-in not seen: B-1) |
| AX-12 | P2 | 3 | 4 | 1 | 12 | a11y | DONE `c5833ed`: focus refs (UI behind sign-in not seen: B-1) |
| AX-13 | P2 | 3 | 5 | 1 | 15 | a11y | DONE `4180f05`: `/scan` link has `aria-current="page"` |
| AX-15 | P2 | 3 | 5 | 1 | 15 | css | DONE `e1caf64`: 320 px page width 320 (was 363) |
| VD-1 | P2 | 2 | 5 | 1 | 10 | css | DONE `e1caf64`: photo tokens |
| VD-3 | P2 | 2 | 5 | 1 | 10 | css | DONE `e1caf64`: motion tokens |
| VD-5 | P2 | 3 | 5 | 1 | 15 | css | DONE `e1caf64`: `color-scheme`; dark FAQ seen |
| VD-4 | P2 | 2 | 4 | 1 | 8 | css | DONE `e1caf64`: one disabled/pressed recipe |
| SEO-2 | P2 | 3 | 5 | 1 | 15 | seo | DONE `15c56ea`, `cd27b14`: per-page og and canonical |
| SEO-3 | P2 | 2 | 5 | 1 | 10 | seo | DONE `cd27b14`: `/demo` in sitemap |
| SEO-4 | P2 | 2 | 4 | 1 | 8 | seo | DONE `15c56ea`: FAQPage and WebApplication JSON-LD in prod HTML |
| CI-1 | P2 | 3 | 5 | 1 | 15 | ci | DONE `cec285e`: Node 22 (CI result read on the PR) |
| T-2 | P2 | 2 | 5 | 1 | 10 | ci | DONE `cec285e`: coverage 41.77% statements over all of `src` |
| RP-1 | P2 | 3 | 4 | 1 | 12 | repo | REJECTED: the repo was renamed to `cartwise`; the README URL is correct and GitHub redirects the old `foodlens` remote. |
| PF-3 | P2 | 3 | 3 | 3 | 3 | perf | REJECTED for this run: paging `/home` and `/grocery` needs a list design (page size, sort, "load more"). No account today is large enough to measure a gain. |
| VD-2 | P2 | 2 | 3 | 4 | 1.5 | css | REJECTED for this run: collapsing 61 font sizes changes every screen, and the app screens cannot be screenshot-checked without sign-in. |
| S-8 | P3 | 3 | 4 | 1 | 12 | auth | DONE `bab32b4`: Google needs `email_verified`; tsc |
| S-9 | P3 | 2 | 5 | 1 | 10 | api | DONE `a19459a`: guard regex `/^[=+-@	]/` |
| C-16 | P3 | 1 | 5 | 1 | 5 | client | DONE `7e8e27f` |
| C-17 | P3 | 2 | 4 | 1 | 8 | parser | DONE `7e8e27f`, `2150bc9`: most frequent symbol, ₹ test |
| AX-14 | P3 | 2 | 5 | 1 | 10 | css | DONE `e1caf64`: reduced motion stops smooth scroll |
| SEO-5 | P3 | 2 | 5 | 1 | 10 | seo | DONE `9172341`: `/login` noindex |
| BP-1 | P3 | 2 | 5 | 1 | 10 | seo | DONE `cd27b14`: Lighthouse Best Practices 92 → 100 on 3 pages |
| CI-2 | P3 | 1 | 5 | 1 | 5 | ci | DONE `cec285e`: one prisma generate |
| RP-2 | P3 | 1 | 5 | 1 | 5 | repo | DONE `47b9874`: README badge, features, scripts |
| A-1 | P3 | 1 | 4 | 2 | 2 | debt | REJECTED for this run: both rankers work. Merging them changes "buy again" output on two pages. |
| A-2 | P3 | 2 | 5 | 1 | 10 | debt | DONE (wrap-up): units picker hidden until imperial output exists; saved value kept. tsc, lint, class-guard test. |
| A-3 | P3 | 2 | 3 | 3 | 2 | debt | REJECTED for this run: ESLint 9 flat-config migration belongs in its own PR. |

## Feature proposals

MAX_NEW_FEATURES is 5. Ten proposals, five selected.

| ID | Feature | User problem | Evidence | Scope | Blocker | Selected |
|---|---|---|---|---|---|---|
| N-1 | Add a barcode product to a shop | Barcode page shows a product and stops. | PRD F2 "save to inventory"; barcode page copy promises "Add an item" (UX-2). | Button on the result, picks a shop, posts to the existing items API. | none | yes, DONE `4afc566`, `0648ee5`: server reads figures by code; tsc (UI behind sign-in not seen: B-1) |
| N-2 | Use-it-up list on Home | Food bought and not marked eaten is forgotten. | PRD user story 5. `consumed` flag already stored. | Pure function over batches: perishable groups, not consumed, bought 2-10 days ago. Card on `/home`. | none | yes, DONE `a740003`: `history.test.ts` |
| N-3 | Download all my data (JSON) | No way to take data out except one CSV per shop. | PRD phase 2 "GDPR data export". Deletion exists, export does not. | `GET /api/account/export`, link in Settings. | none | yes, DONE `fbe2948`: unauthenticated GET → 401 (UI behind sign-in not seen: B-1) |
| N-4 | Camera barcode scan | Typing 13 digits on a phone. | PRD F2 "Scan product barcode". | `BarcodeDetector` where the browser has it; typed entry stays. | none (progressive) | yes, DONE `0648ee5`: progressive; tsc (UI behind sign-in not seen: B-1) |
| N-5 | Scan first, sign in to save | PRD §5 asks for sign-in after the photo; today sign-in comes first. | PRD §5 flow. | `/scan` public, text lines held in `sessionStorage` across sign-in, sent after. | none | yes, DONE `3464207`: `/scan` opens signed out (screen in `screens/after`) |
| N-6 | Push "use it up" reminders | Reminder when not in the app. | PRD §5 day-2 notification. | Web Push. | needs VAPID keys and a sender (B-3) | no, PARKED B-3 |
| N-7 | This shop vs last shop by food group | Trend per group. | Home shows produce change only. | Extra card. | none | no: lower value |
| N-8 | Imperial units output | `units` setting did nothing. | A-2. | Format layer. | none (picker hidden) | no |
| N-9 | Playwright smoke test | No browser test. | T-1. | Public pages and `/demo`. | none | no: tooling; listed as a toolbox gap |
| N-10 | Share a read as an image | Social proof. | not in the PRD | OG image per batch. | privacy decision | no |
