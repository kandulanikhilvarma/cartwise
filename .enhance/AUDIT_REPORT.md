# Audit report

Branch `enhance/2026-09-29`, base `958d621`. Sources: main-session review (security, performance, reliability, CI, repo) and two read-only subagents (parsing/client/tests; accessibility/UX/visual/SEO). Every row has evidence. Line numbers refer to the base commit. Paths are under `src/` unless stated.

Severity: P0 broken, insecure or data-loss risk. P1 production gap. P2 clear gain. P3 polish.

## Scores (before)

| Dimension | Score | Reason |
|---|---|---|
| Correctness | 4/10 | Parser fails on two-line items, discounts and payment lines. Barcode route returns invented products. |
| Security | 4/10 | 3 critical CVEs in `next` and `next-auth` (one is an auth fail-open that matches the middleware check). Public health route leaks the DB host and raw errors. |
| Performance | 6/10 | Small bundles (102 kB shared). Every marketing page is dynamic because the nav calls `auth()`. |
| Reliability | 6/10 | Good timeout and outage handling in `food-lookup.ts`. Barcode fetch has no timeout. Undo can lose an item. |
| Tests | 4/10 | 57 tests on pure functions. Pipeline glue, history and all components untested. 77.5% statements on the 4 imported files only. |
| CI/DX | 6/10 | Lint, types, tests, build, CodeQL, dependency review. Node 20 in CI (EOL), no coverage, no smoke test. |
| Architecture | 7/10 | Clear feature folders. Some duplication (two "frequent items" rankers). |
| Accessibility | 5/10 | Good base. Cropper is pointer-only. 4 contrast or focus failures. No skip link on 5 marketing pages. |
| UX and content | 6/10 | Good empty states. Batch-list delete has no confirm. Barcode page promises "add" and cannot. |
| Visual design | 6/10 | Real token layer. 61 raw font sizes, untokenized motion, no `color-scheme`. |
| SEO | 4/10 | 6 sitemap pages share the root title. og:url is the homepage everywhere. No canonical, no JSON-LD. |
| Repo presentation | 7/10 | Strong README with 4 Mermaid diagrams. Clone URL names the wrong repository. |
| Production readiness | 6/10 | Security headers, CSP, migrations, account deletion. Health route is public and verbose. |

## Findings

### Security (S)

| ID | Sev | Evidence | Impact | Fix | Eff | User? |
|---|---|---|---|---|---|---|
| S-1 | P0 | `npm audit --omit=dev`: `next@15.5.19` critical, `next-auth@5.0.0-beta.29` / `@auth/core@0.40.0` critical, incl. "configuration errors can cause existence-based auth checks to fail open". `middleware.ts:9` checks `Boolean(request.auth)`. | Protected routes can open on an auth config error. Server Actions DoS and cache confusion advisories. | `next@15.5.26`, `next-auth@5.0.0-beta.32`. | S | no |
| S-2 | P1 | `app/api/health/route.ts:8,19` returns the DB hostname and raw Prisma error text to anyone. | Recon aid: exposes the Supabase project host and driver errors. | Return status only. Log the detail. | S | no |
| S-3 | P2 | `app/api/grocery/receipt/route.ts:66-67` returns `error.message` to the client. `app/error.tsx:18` renders `error.message`. | Prisma and runtime internals shown to users. | Fixed copy to the client, detail to the log. | S | no |
| S-4 | P2 | `app/api/grocery/[batchId]/items/[itemId]/route.ts:19-43`, `.../items/route.ts:30`, `.../[batchId]/route.ts:35`: no type or length checks. `{ "productName": 5 }` hits `.trim()` on a number. | 500 on bad input. Unbounded strings reach the DB and the external lookups. | Validate types, cap names, reject bad quantity. | S | no |
| S-5 | P2 | `app/api/food-db/barcode/[code]/route.ts:74` fetch has no timeout. `:112` accepts any digit count. `:38` cache `Map` grows without bound. | A slow source holds the function to the platform limit. Memory growth. | `AbortSignal.timeout`, 8-14 digits, cap the cache. | S | no |
| S-6 | P2 | `infrastructure/state/batch-store.ts:423,428,549,743`: memory mode ignores `ownerEmail`. | With no `DATABASE_URL`, user B sees and deletes user A's batches. `deleteAccount` clears every user. | Store the owner on each memory batch and filter by it. | S | no |
| S-7 | P2 | `infrastructure/cache/rate-limit.ts:42-58`: INCR then a separate EXPIRE. `:6` memory buckets never pruned. | If EXPIRE fails, the key never expires and that client stays blocked. Slow memory growth. | One `pipeline` call with `EXPIRE ... NX`. Prune expired buckets. | S | no |
| S-8 | P3 | `auth.ts:22-31`: no `signIn` callback. Data is keyed by email (`batch-store.ts:317`). | An unverified Google email could claim another user's data. | Require `profile.email_verified` for Google. | S | no |
| S-9 | P3 | `app/api/grocery/[batchId]/export/route.ts:32` guards `= + - @` only. | Leading tab or CR still starts a formula in some spreadsheet apps (OWASP CSV injection list). | Add `\t` and `\r`. | S | no |
| S-10 | P1 | `npm audit`: `postcss@8.4.31` (pinned by `next`) high, `sharp@0.34.5` high, `nanoid@3.3.17` high. | Build-time and image-optimizer advisories. | npm `overrides`: `postcss@^8.5.28`, `sharp@^0.35.5`. | S | no |

### Correctness (C)

| ID | Sev | Evidence | Failing input and result | Fix | Eff |
|---|---|---|---|---|---|
| C-1 | P1 | `infrastructure/ocr/receipt-parse.ts:244-247` | Two-line items lost: `BANANAS` then `0.456 kg @ 2.99/kg 1.36` gives no item. | Merge a pending name line with the next nameless price line. | M |
| C-2 | P1 | `receipt-parse.ts:20,57` | `SUB TOTAL 45.67`, `CONTACTLESS 45.67`, `TO PAY`, `YOU SAVED 2.10` parse as items. `MULTIBUY SAVING -0.50` becomes an item priced +0.50. | Extend the noise pattern. Drop negative-amount lines. | S |
| C-3 | P1 | `infrastructure/ocr/receipt-ocr.ts:33-35` dedupes on cleaned name. | `YOGURT 500g 1.20` and `YOGURT 150g 0.60` keep only one. Spend is under-counted. | Dedupe identical raw lines only. | S |
| C-4 | P2 | `receipt-parse.ts:11` strips `×`. | `3 × 500 ml OAT MILK 4.50` gives quantity 1. | Map `×` to `x`. | S |
| C-5 | P2 | `receipt-parse.ts:37` | `6 BREAD ROLLS 300g 1.20` gives 1800 g. `YOGURT 4 x 125g 2.00` gives 125 g. | Parse `N x weight` anywhere; a bare leading count is not a pack multiplier. | M |
| C-6 | P2 | `receipt-parse.ts:78` | `TOTAL SAVINGS 2.50` before `TOTAL 45.67` gives 2.50. `1,234.56` gives 234.56. | Skip saving/discount/VAT totals. Strip thousands separators. | S |
| C-7 | P2 | `receipt-parse.ts:151,170`; `BatchHeader.tsx:23`, `BatchList.tsx:19` | Receipt dated 25 March shows 24 March west of UTC. `05/05/2026` returns null. | Format with `timeZone: 'UTC'`. Accept day equal to month. | S |
| C-8 | P2 | `features/nutrition/lib/batch-insights.ts:227,304` | Nothing weighed: UI claims "Vitamin D 0.0 µg, under a day's worth". | No nutrient gap when nothing is weighed. | S |
| C-9 | P2 | `batch-insights.ts:335,356` | Cost per gram of protein divides all spend by protein of weighed items only. | Use priced items that are also weighed and matched. | S |
| C-10 | P2 | `NutritionSummary.tsx:191` vs `grocery/lib/history.ts:33` | Batch page and home page show different totals for one shop. | Prefer the printed receipt total in both. | S |
| C-11 | P1 | `GroceryItemList.tsx:293-311` | Undo is cleared before the restore POST. A failed restore loses the item. A good one drops `linePrice`. | Clear undo after success. Send `linePrice`. | M |
| C-12 | P2 | `GroceryItemList.tsx:86,111,536-540` | Two quick toggles: the slower response overwrites the newer state. | Ignore stale responses. | S |
| C-13 | P2 | `GroceryItemList.tsx:200,260,268`; `SettingsForm.tsx:110` | "0,5" becomes NaN, then null, and the status says "saved". Quantity "-3" is sent. | Accept comma decimals. Require a value above 0. | S |
| C-14 | P1 | `app/api/food-db/barcode/[code]/route.ts:15-36,124` | When Open Food Facts misses or is down, `036000291452` returns "Greek yogurt, Cartwise Pantry" with invented figures. The product promises "never fabricated numbers". | Delete the fallback table. | S |
| C-15 | P1 | `barcode/[code]/route.ts:53` | Falls back to `energy-kcal_serving` while every other figure and the UI label say per 100 g. | Per-100 g fields only. | S |
| C-16 | P3 | `ReceiptUploader.tsx:84,90` | `createObjectURL` inside a state updater leaks one URL per add under StrictMode. | Compute outside the updater. | S |
| C-17 | P3 | `receipt-parse.ts:68`; `history.ts:95-96` | `TOTAL £12.48 (US$ 15)` gives USD. History adds GBP and USD shops into one figure. | Most frequent symbol. Sum one currency. | S |

### Performance (PF)

| ID | Sev | Evidence | Impact | Fix | Eff |
|---|---|---|---|---|---|
| PF-1 | P1 | Build output: `/`, `/about`, `/faq`, `/how-it-works`, `/contact`, `/privacy`, `/terms` are all `ƒ`. Cause: `shared/components/MarketingNav.tsx:16` calls `auth()`, which reads cookies. | No CDN caching. Every marketing view is a serverless render. | Static nav. A small client island reads `/api/auth/session` and swaps the CTA. | M |
| PF-2 | P2 | `app/demo/page.tsx:18` `revalidate = 3600` is dead: lookups use `cache: 'no-store'`. Build log shows 12 `foodMatch.findUnique` calls to the production DB during prerender. | Misleading comment. Builds touch the production DB and external APIs. | `dynamic = 'force-dynamic'`. Correct the comment. | S |
| PF-3 | P2 | `batch-store.ts:430-435` `listBatches` loads every item of every batch for `/home` and `/grocery`. | Cost grows with account age. | Paged list. | M |

### Reliability (R), Tests (T), CI/DX (CI), Architecture (A)

| ID | Sev | Evidence | Impact | Fix | Eff |
|---|---|---|---|---|---|
| R-1 | P2 | `app/api/health/route.ts:11` returns 500 when `DATABASE_URL` is unset, although no-DB mode is supported. | False alarm for a monitor. | 200 with `db: 'memory'`. | S |
| T-1 | P1 | No test imports `receipt-ocr.ts`, `history.ts`, `batch-store.ts`, the barcode route or `rate-limit.ts`. | C-1 to C-6 and S-6 pass CI today. | Tests with the fix for each bug. | M |
| T-2 | P2 | `vitest.config.ts` has no `coverage.include`. | Coverage counts only imported files, which overstates it. | `coverage.include`, `npm run coverage`. | S |
| CI-1 | P2 | `.github/workflows/ci.yml:17` Node 20 (EOL April 2026). `:22` runs `prisma generate` again after `postinstall`. | EOL runtime. Duplicate step. | Node 22. Drop the duplicate. | S |
| CI-2 | P3 | `package.json` has no `typecheck` script. | CI and local run different commands. | `"typecheck": "tsc --noEmit"`. | S |
| A-1 | P3 | `grocery/lib/history.ts:59-80` and `batch-store.ts:447-476` rank "frequent items" two ways. | Two definitions of "buy again". | Keep one. | S |
| A-2 | P3 | `units` setting is saved but never read. | A setting that does nothing. | Hide until imperial output exists. | S |
| A-3 | P3 | `eslint@8` (EOL) and `next lint` (deprecated in 15.5). | Future break. | ESLint 9 flat config. | M |

### Accessibility (AX), UX, Visual (VD), SEO

| ID | Sev | Evidence | Impact | Fix | Eff |
|---|---|---|---|---|---|
| AX-1 | P1 | `ReceiptCropper.tsx:85-92` pointer handlers only. | Keyboard users cannot crop (2.1.1, 2.5.7). | Arrow keys move the crop. | M |
| AX-2 | P1 | `globals.css:1055-1066` input border `--line-strong` about 1.95:1. | Fields fail 1.4.11. | Border `--ink-faint`. | S |
| AX-3 | P1 | `--unmatched` chip text 3.3:1 on paper (`globals.css:45,1611`). | Fails 1.4.3. | Text in `--ink-soft`. | S |
| AX-4 | P1 | Focus ring `--accent-text` (`globals.css:210`) about 2.1:1 on toast, about 1.5:1 on the hero. | Focus not visible. | `--on-green` ring on dark surfaces. | S |
| AX-5 | P2 | Dark toast undo `--accent-soft` about 4.2:1 (`globals.css:98,1796`). | Fails 1.4.3. | `--on-green`, underlined. | S |
| AX-6 | P2 | Light `--ink-faint` 4.24:1 on paper. | Fails 1.4.3 on the page ground. | Darken to about `#6d6450`. | S |
| AX-7 | P1 | No skip link on `about`, `contact`, `demo`, `faq`, `how-it-works`, `privacy`, `terms`, `not-found`. Nav and footer inside `<main>`. | Fails 2.4.1. | Skip link in the marketing nav. Landmarks fixed. | M |
| AX-8 | P1 | `BarcodeLookup.tsx:83,86`, `BatchHeader.tsx:144`, `BatchList.tsx:94`: results and errors not announced. | Fails 4.1.3. | Always-mounted live regions. | S |
| AX-9 | P2 | Alerts mounted with text at `ReceiptUploader.tsx:289`, `GroceryItemList.tsx:387`, `SettingsForm.tsx:208`. | Often not announced. | Always-mounted regions. | S |
| AX-10 | P2 | `Meter.tsx:61-63` `aria-valuenow` above `aria-valuemax`. | Invalid ARIA. | Clamp. | S |
| AX-11 | P2 | Repeated "Edit", "Remove", "Delete" per row. | Ambiguous names. | Add the item name to the label. | S |
| AX-12 | P2 | `BatchHeader.tsx:104-141` focus drops to body after swaps. | Fails 2.4.3. | Move focus with a ref. | S |
| AX-13 | P2 | `(app)/layout.tsx:39-43` no `aria-current`. | Current page not shown. | Client nav link with `usePathname`. | S |
| AX-14 | P3 | `globals.css:160` smooth scroll beats the reduced-motion rule. | Motion under reduce. | Reset on `html` in the media query. | S |
| AX-15 | P2 | `globals.css:1896-1908` app nav scrolls sideways at 320 px, scrollbar hidden. | Hidden links (1.4.10). | Wrap. | S |
| UX-1 | P1 | `BatchList.tsx:127-133` Delete fires on one click. | One mis-tap destroys a shop. | Two-step confirm. | S |
| UX-2 | P2 | `(app)/barcode/page.tsx:7-8` promises "Add an item". `BarcodeLookup.tsx:86-103` has no add action. PRD F2: "save to inventory". | Dead end. | "Add to a shop" (feature N-1). | M |
| UX-3 | P2 | `BarcodeLookup.tsx:50-52` every error reads "Barcode not found". | A 429 or outage looks like a miss. | Show the server message. | S |
| UX-4 | P2 | `(auth)/login/page.tsx` ignores `?error=`. | Failed sign-in is silent. | Show a message. | S |
| UX-5 | P2 | `SettingsForm.tsx:80,208` delete error shows in the first card. | Delete failure invisible. | Error beside the button. | S |
| UX-6 | P2 | Zero-item batch shows "0 of 0 eaten" and a blank list (`GroceryItemList.tsx:317,393`). | Unexplained empty state. | Empty-state copy. | S |
| VD-1 | P2 | Raw colours at `globals.css:530-575` despite the header claim. | Token contract broken. | `--scrim`, `--on-photo` tokens. | S |
| VD-2 | P2 | 61 raw `font-size` values, 5 uses of `--step-*`. | Type scale not enforced. | Small-text tokens. | M |
| VD-3 | P2 | 29 literal durations and two easings. | Motion not tokenized. | `--dur-*`, `--ease-out`. | S |
| VD-5 | P2 | No `color-scheme`. Dark block duplicated (`globals.css:82-118`, `:120-154`). | Native controls stay light in dark mode. | Add `color-scheme`. | S |
| SEO-1 | P1 | `how-it-works`, `about`, `faq`, `contact`, `privacy`, `terms` export no metadata. | Six indexable pages with the root title. | Per-page `metadata`. | S |
| SEO-2 | P2 | `app/layout.tsx:40` og:url fixed to the homepage. No canonical. | Wrong share URL on every page. | `alternates.canonical`, drop the fixed url. | S |
| SEO-3 | P2 | `sitemap.ts:4-15` omits `/demo`, `lastModified = new Date()`. | Missing page, false freshness. | Add `/demo`, drop the fake date. | S |
| SEO-4 | P2 | No JSON-LD. | No rich results. | `WebApplication` on home, `FAQPage` on `/faq`. | S |
| SEO-5 | P3 | `/login` indexable. | Thin page in the index. | `robots: { index: false }`. | S |

### Repo presentation (RP)

| ID | Sev | Evidence | Impact | Fix | Eff |
|---|---|---|---|---|---|
| RP-1 | P2 | `README.md` clone command uses `cartwise.git`; `git remote -v` is `kandulanikhilvarma/foodlens.git`. | Quick start may fail from a clean clone. | Use the real remote. | S |
| RP-2 | P3 | README badges are static; no CI status badge. | CI state invisible. | Actions badge for `ci.yml`. | S |
