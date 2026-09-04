# Implementation Log

## Purpose
Keep a short, readable record of what changed, why it changed, and how to reproduce or extend it.

## Current State
- Next.js 15 scaffold is in place.
- Public landing page exists.
- Route groups exist for app and auth surfaces.
- Receipt upload flow extracts OCR text and finalizes receipt items, with Prisma-backed persistence when `DATABASE_URL` is set.
- Receipt processing now has a `processing` state and polling endpoint.
- Batch list and batch detail read from the same store and are scoped to the signed-in user.
- Grocery items can be marked consumed and the batch UI shows that state.
- Grocery items now support add, edit, and remove actions from the batch detail UI.
- Barcode lookup now uses Open Food Facts with a local fallback cache.
- Google sign-in route and session chip are wired.
- Protected app routes and sign-out are wired.
- Batch persistence now targets Prisma and falls back to memory when no database is configured.
- Build currently passes.

## Change Log

### 2026-06-27 - Initial scaffold
- Added Next.js app shell.
- Added landing page.
- Added shared styling and typography.
- Added Prisma schema and client.
- Added shared utilities and constants.
- Verified the app builds successfully.

### 2026-06-27 - First route structure
- Added route groups for `app` and `auth`.
- Added `/scan`, `/grocery`, `/grocery/[batchId]`, `/barcode`, and `/login` routes.
- Added lightweight placeholder feature components for auth and grocery.
- Verified the route tree builds successfully.

### 2026-06-27 - Receipt flow mock
- Added a receipt uploader on the scan page.
- Added `POST /api/grocery/receipt`.
- Added `GET /api/grocery/[batchId]`.
- Added nutrition summary logic and display.
- Verified upload returns a batch object and the UI renders it.

### 2026-06-27 - Shared batch store
- Added a shared in-memory batch store.
- Switched receipt upload and batch detail to the same store.
- Switched batch list to read the same store.
- Added basic result styling.
- Verified the build still passes.

### 2026-06-27 - Processing state and polling
- Added a `processing` batch state.
- Added `GET /api/grocery/receipt/[batchId]` for polling.
- Made uploads complete after a short delay.
- Added client polling in the receipt uploader.
- Verified the build still passes.

### 2026-06-27 - Item consumption action
- Added `consumed` and `consumedAt` fields to grocery items.
- Added `PATCH /api/grocery/[batchId]/items/[itemId]`.
- Added a batch item list client component with consumed toggles.
- Wired the batch detail page to use the shared item list component.
- Verified the build still passes.

### 2026-06-27 - Item consumption polish
- Added visible consumed state in the batch item list.
- Styled consumed items with lower emphasis and strike-through labels.
- Kept the implementation log current with the new UI state.
- Verified the build still passes.

### 2026-06-27 - Barcode lookup
- Added `GET /api/food-db/barcode/[code]`.
- Added a barcode lookup component on the barcode page.
- Rendered nutrition cards for known barcode results.
- Verified the build still passes.

### 2026-07-20 - Auth shell
- Added `src/auth.ts` with Google provider config.
- Added `GET` and `POST` NextAuth route handlers.
- Swapped login CTA to real `signIn('google')`.
- Added a session chip in app shell.
- Verified the build still passes.

### 2026-07-20 - Auth protection
- Added `middleware.ts` for `/scan`, `/grocery`, and `/barcode`.
- Added `SignOutButton`.
- Rendered sign-out in app shell when session exists.
- Kept login page linked and simple.
- Verified the build still passes.

### 2026-07-20 - Batch persistence
- Routed grocery batches and items through Prisma-backed storage.
- Kept a memory fallback so the app still runs without a configured database.
- Scoped batch reads and updates to the signed-in user email.
- Verified the build still passes.

### 2026-07-20 - Barcode lookup
- Swapped the barcode route to Open Food Facts lookup.
- Added a local cache plus fallback barcode records for offline resilience.
- Kept the barcode page UI unchanged.
- Verified the build still passes.

### 2026-07-20 - Receipt OCR
- Added a Tesseract-based receipt OCR service.
- Finalized receipt batches with OCR-derived items instead of demo items.
- Kept polling and batch detail behavior unchanged.
- Verified the build still passes.

### 2026-08-05 - Grocery item correction loop
- Added `GET /api/grocery` for listing signed-in user's batches.
- Added `POST /api/grocery/[batchId]/items` for manual item add.
- Extended `PATCH /api/grocery/[batchId]/items/[itemId]` to support name, quantity, unit, and consumed updates.
- Added `DELETE /api/grocery/[batchId]/items/[itemId]` for item removal.
- Updated shared batch store with add/update/remove operations for both Prisma and memory fallback modes.
- Updated the batch detail item list UI with add, inline edit, and remove controls.
- Refined scan, barcode, and receipt copy and refreshed visual tokens to a cleaner, less templated style.
- Verified with `npm run build` (passes).

### 2026-08-05 - Homepage clarity rewrite
- Reworked the homepage hero to clearly state product value, audience, and first action.
- Replaced vague marketing copy with outcome-driven messaging aligned to PRD v2 (receipt-first loop, 3 insights, lightweight corrections).
- Added a trust and product-boundaries section to clarify auth, OCR behavior, and barcode fallback.
- Tuned homepage styles for stronger hierarchy and mobile readability.
- Verified with `npm run build` (passes).

## How to Extend
- Add one small change at a time.
- Update this file after each meaningful feature or structural change.
- Keep the entry format: date, change, result, verification.
- If a change touches routes, note the endpoint names.
- If a change adds UI, note the component names.
- If a change affects data flow, note the store or service used.
- Keep each entry short enough that someone can reproduce the change without reading the whole codebase.

### 2026-09-03 - Audit pass: truthful totals, design system, repo

Findings came from a full read of the shipped build (74 logged). The headline
defect: batch totals summed per-100g figures across items and compared them to a
daily RDA, so every reported number described "N arbitrary 100 g portions".

Data and correctness
- Added packGrams, linePrice, receipt date, printed total, currency and a
  truncation flag to the parse; totals now scale by real mass and exclude
  unweighed items rather than guessing.
- Two parser bugs found by running a real receipt through the new /demo route:
  stripCodes removed any trailing word of 6+ letters ("BABY SPINACH" -> "Baby"),
  and lines with no price or weight (shop name, street address) parsed as food.
- The printed price is the extended line total, so it is no longer multiplied by
  quantity. Batch spend now equals the receipt total.
- A shop is measured against a week for the household, not one person's day.
- Renaming an item re-matches its nutrition, which the UI already claimed.
- Matches that are impossible per 100 g are discarded.
- Nutrition cache moved from a per-process Map into Postgres; lookups run five
  at a time with a 6s timeout instead of serially.
- Item cap raised from 12 to 60 and surfaced when crossed.

Product
- Dashboard, settings (profile, household, units, account deletion), batch
  search/sort/rename/delete, CSV export, undo on item removal.
- Signed-out /demo running the real pipeline on a fixed sample receipt.
- OCR pre-processing (grayscale, contrast stretch, downscale) before Tesseract.
- PWA manifest, icon, robots, sitemap, OG image, security headers.

Design
- Full token layer: type scale, space scale, semantic signals, chart palette,
  and --accent-text for marmalade, which measured 3.66:1 on paper and failed the
  contrast floor everywhere it was used at small sizes.
- Fragment Mono plus tabular figures; Hanken Grotesk 500/600/700.
- Theme toggle, meters, skeletons, toast, item chips.
- Marketing nav wraps on mobile instead of disappearing under 900px.
- Removed dead CSS (figure-reveal, .home-hero-figure, .home-hero-tag) and the
  hero kicker DESIGN.md forbade; DESIGN.md rewritten to match what ships.

Repo
- README rebuilt around four validated Mermaid diagrams; clone URL corrected
  to match the repository name.
- Root/docs duplicate documents collapsed; the stale TRD in docs/ replaced with
  the accurate root copy.
- CONTRIBUTING, issue and PR templates, CodeQL workflow, dependabot for actions.

Verified: lint clean, tsc clean, 50 tests pass, production build succeeds.

### 2026-09-04 - Closing the open ledger

The build ledger had 22 findings still open. Seven of them turned out to be
already fixed by later work and were closed on inspection rather than rebuilt:
batch search and sort, OCR pre-processing, the item-row grid, the root/docs
duplicate documents, the contributing guide and templates, CodeQL, and the
README's four diagrams.

Truth
- "2 x 400g BEANS" parsed as one 400 g tin. extractQuantity rejected any leading
  number not followed by a letter, so an explicit multiplier in front of a pack
  size was dropped and the line reported half its real mass.
- A receipt with no store name on it took the name of the uploaded image file.
  Two code paths did this; both now leave it null and the UI offers a rename.
- Match confidence rendered as "70% match" / "85% match". Those are the two
  source constants with a percent sign attached, not a measurement. Items name
  the database that answered instead.
- Allergens and additives were already in the Open Food Facts payload being
  parsed for nutriments, and were being thrown away.
- A lookup that failed because a source was down was cached as "not found" for
  the full 30-day TTL. One Open Food Facts 503 during this session marked all
  twelve demo items unmatched and kept them that way while USDA had answers for
  every one. Reachability and emptiness are now different things.

Product
- Multi-photo scans: a long till roll goes in as several photos, read in
  sequence on the device and submitted as one shop.
- Drag-to-crop on each photo before OCR.
- Manual food search across both sources for an item the OCR garbled, plus a
  retry that goes past a cached miss.
- Buy-again list on the batch page, from items bought in more than one previous
  shop. Bought once is not a habit.

Design
- One icon set replacing inline SVG copied between components and the literal
  "→" and "✕" characters a screen reader announces as "rightwards arrow".
- Button primitive; the variant had been a hand-typed class string in 52 places
  across 17 files.

Infrastructure
- onRequestError gives every server error one structured line, with an optional
  ERROR_WEBHOOK_URL to forward it. Vercel Analytics for page counts.
- Dependency review workflow alongside CodeQL; code of conduct.
- The Supabase project was paused, not deleted. Restoring it kept DATABASE_URL
  valid, so no credential rotation was needed. Both pending migrations applied.
- vitest was loading .env, so the lookup cache tests were reading from and
  writing to the production database. They passed only because it was
  unreachable; restoring it turned one red and left six fixture rows in
  FoodMatch. Tests now run with DATABASE_URL empty.

Still open: README screenshots of the scan and batch views, which sit behind
Google sign-in and need a signed-in capture.

Verified: lint clean, tsc clean, 57 tests pass, production build succeeds,
/demo reads 12 of 12 against the live sources.
