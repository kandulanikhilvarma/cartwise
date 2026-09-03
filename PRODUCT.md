# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Weekly grocery shoppers who buy roughly the same things each week and want to
understand the nutrition of what they bought without daily food logging. They
shop regularly and keep receipts. Not aimed at people who mostly eat out or
don't retain receipts. On a phone in or just after the grocery trip; camera and
file upload both supported.

## Product Purpose

Cartwise turns one grocery receipt into a structured grocery batch with real
per-item nutrition, what the shop cost, and a short, plain-language summary. The wedge is passive
data: a receipt photo is the only "logging" that doesn't require daily effort,
which is why most nutrition apps lose ~97% of users by day 30. Success = a
shopper gets a useful nutrition read of their shop within a minute of scanning,
and comes back to scan again next week.

## Positioning

Receipt scan as passive food inventory. Instead of manual meal logging or
barcode-by-barcode entry, the whole shop is captured from one photo, OCR'd in
the browser, and matched to real nutrition data (USDA FoodData Central, with
Open Food Facts fallback). Barcode lookup is the single-item fallback, not the
main path.

## Operating Context

Flow: sign in with Google → scan/upload a grocery receipt → browser OCR reads
the text → server matches items to nutrition data and saves the batch → shopper
sees matched items + a three-signal nutrition summary and can edit/mark-consumed
items. Barcode lookup available for items a receipt missed.

## Capabilities and Constraints

- Receipt OCR runs client-side (Tesseract.js); the server never receives the
  image, only the extracted text lines.
- Nutrition is real per-100g data from USDA FDC / Open Food Facts, cached in
  Postgres by product name. Figures are scaled by the pack weight printed on the
  receipt; a line stating no weight is left out of the totals and reported in the
  coverage line. Unmatched items are shown honestly as unmatched — never filled
  with fabricated numbers, and a match that is impossible per 100 g is discarded.
- A shop is measured against a week for the household, not one person's day, so
  a full trolley is not reported as an excess. Household size lives in Settings.
- Prices printed on the receipt become spend by food group and cost per gram of
  protein. The printed amount is the extended line total, never a unit price.
- Auth: Google OAuth (Auth.js v5), JWT sessions. GitHub optional.
- Persistence: Postgres via Prisma (Neon in production). No permanent image
  storage; receipt images are processed for OCR only.
- Stack: Next.js 15 (App Router), React 19, TypeScript, hand-written CSS with
  design tokens. Deploy target: Vercel + Neon.
- Nutrition figures are informational estimates, not medical or dietetic advice.

## Brand Commitments

- Name: **Cartwise** (binding, set this session; supersedes the earlier
  NutriLens/FoodLens working names).
- Voice: plain, honest, non-hype. No fake data, no fabricated stats, no
  gamification. Says what it does and does not do.

## Evidence on Hand

- Working app: receipt→batch→nutrition loop, barcode lookup, item CRUD.
- Real external data source: USDA FoodData Central + Open Food Facts (live).
- No real user testimonials, customer names, download counts, or benchmarks
  exist yet — future marketing work must not invent them.
- Homepage imagery: real grocery/produce/receipt photography to be sourced
  (free-licensed, e.g. Unsplash) and stored in the repo.

## Product Principles

- Passive over manual: the receipt does the logging.
- Honest over impressive: show unmatched items and real confidence, never fake
  nutrition to look complete.
- One clear first step, no onboarding wall. A signed-out visitor can run a real
  receipt through the real pipeline at /demo before creating anything.
- Privacy by default: the receipt image stays on the device.
