# Backlog

Score = Impact (1-5) × Confidence (1-5) ÷ Effort (1-5). Order: P0, then P1, then score. Every changed line traces to an ID here. Details and evidence are in `AUDIT_REPORT.md`.

Status: TODO, DONE (with evidence), PARKED (blocker ID), REJECTED (reason).

## Fixes

| ID | Sev | I | C | E | Score | Group | Status |
|---|---|---|---|---|---|---|---|
| S-1 | P0 | 5 | 5 | 1 | 25 | deps | DONE `8d0f897`: prod audit 6 → 0, 57 tests, build green |
| S-10 | P1 | 4 | 5 | 1 | 20 | deps | DONE `8d0f897` |
| S-2 | P1 | 4 | 5 | 1 | 20 | api | TODO |
| C-14 | P1 | 5 | 5 | 1 | 25 | api | TODO |
| C-15 | P1 | 4 | 5 | 1 | 20 | api | TODO |
| C-2 | P1 | 5 | 5 | 1 | 25 | parser | TODO |
| C-3 | P1 | 4 | 5 | 1 | 20 | parser | TODO |
| C-1 | P1 | 5 | 4 | 2 | 10 | parser | TODO |
| T-1 | P1 | 4 | 5 | 2 | 10 | tests | TODO (lands with each fix) |
| UX-1 | P1 | 5 | 5 | 1 | 25 | client | TODO |
| C-11 | P1 | 4 | 4 | 2 | 8 | client | TODO |
| PF-1 | P1 | 4 | 4 | 2 | 8 | perf | TODO |
| AX-2 | P1 | 4 | 5 | 1 | 20 | css | TODO |
| AX-3 | P1 | 3 | 5 | 1 | 15 | css | TODO |
| AX-4 | P1 | 4 | 4 | 1 | 16 | css | TODO |
| AX-7 | P1 | 4 | 5 | 2 | 10 | a11y | TODO |
| AX-8 | P1 | 3 | 5 | 1 | 15 | a11y | TODO |
| AX-1 | P1 | 4 | 4 | 3 | 5.3 | a11y | TODO |
| SEO-1 | P1 | 4 | 5 | 1 | 20 | seo | TODO |
| S-3 | P2 | 3 | 5 | 1 | 15 | api | TODO |
| S-4 | P2 | 3 | 5 | 1 | 15 | api | TODO |
| S-5 | P2 | 3 | 5 | 1 | 15 | api | TODO |
| S-6 | P2 | 3 | 5 | 1 | 15 | store | TODO |
| S-7 | P2 | 3 | 4 | 1 | 12 | api | TODO |
| R-1 | P2 | 2 | 5 | 1 | 10 | api | TODO (with S-2) |
| C-4 | P2 | 3 | 5 | 1 | 15 | parser | TODO |
| C-6 | P2 | 4 | 5 | 1 | 20 | parser | TODO |
| C-7 | P2 | 3 | 5 | 1 | 15 | parser | TODO |
| C-5 | P2 | 3 | 4 | 2 | 6 | parser | TODO |
| C-8 | P2 | 4 | 5 | 1 | 20 | insights | TODO |
| C-9 | P2 | 3 | 5 | 1 | 15 | insights | TODO |
| C-10 | P2 | 3 | 5 | 1 | 15 | insights | TODO |
| C-12 | P2 | 3 | 4 | 1 | 12 | client | TODO |
| C-13 | P2 | 3 | 5 | 1 | 15 | client | TODO |
| UX-3 | P2 | 3 | 5 | 1 | 15 | client | TODO |
| UX-4 | P2 | 3 | 5 | 1 | 15 | client | TODO |
| UX-5 | P2 | 3 | 5 | 1 | 15 | client | TODO |
| UX-6 | P2 | 2 | 5 | 1 | 10 | client | TODO |
| UX-2 | P2 | 4 | 5 | 2 | 10 | feature | TODO (as N-1) |
| PF-2 | P2 | 3 | 5 | 1 | 15 | perf | TODO |
| AX-5 | P2 | 3 | 5 | 1 | 15 | css | TODO |
| AX-6 | P2 | 3 | 5 | 1 | 15 | css | TODO |
| AX-9 | P2 | 3 | 4 | 1 | 12 | a11y | TODO |
| AX-10 | P2 | 2 | 5 | 1 | 10 | a11y | TODO |
| AX-11 | P2 | 3 | 5 | 1 | 15 | a11y | TODO |
| AX-12 | P2 | 3 | 4 | 1 | 12 | a11y | TODO |
| AX-13 | P2 | 3 | 5 | 1 | 15 | a11y | TODO |
| AX-15 | P2 | 3 | 5 | 1 | 15 | css | TODO |
| VD-1 | P2 | 2 | 5 | 1 | 10 | css | TODO |
| VD-3 | P2 | 2 | 5 | 1 | 10 | css | TODO |
| VD-5 | P2 | 3 | 5 | 1 | 15 | css | TODO |
| VD-4 | P2 | 2 | 4 | 1 | 8 | css | TODO |
| SEO-2 | P2 | 3 | 5 | 1 | 15 | seo | TODO |
| SEO-3 | P2 | 2 | 5 | 1 | 10 | seo | TODO |
| SEO-4 | P2 | 2 | 4 | 1 | 8 | seo | TODO |
| CI-1 | P2 | 3 | 5 | 1 | 15 | ci | TODO |
| T-2 | P2 | 2 | 5 | 1 | 10 | ci | TODO |
| RP-1 | P2 | 3 | 4 | 1 | 12 | repo | TODO |
| PF-3 | P2 | 3 | 3 | 3 | 3 | perf | REJECTED for this run: paging `/home` and `/grocery` needs a list design (page size, sort, "load more"). No account today is large enough to measure a gain. |
| VD-2 | P2 | 2 | 3 | 4 | 1.5 | css | REJECTED for this run: collapsing 61 font sizes changes every screen, and the app screens cannot be screenshot-checked without sign-in. |
| S-8 | P3 | 3 | 4 | 1 | 12 | auth | TODO |
| S-9 | P3 | 2 | 5 | 1 | 10 | api | TODO |
| C-16 | P3 | 1 | 5 | 1 | 5 | client | TODO |
| C-17 | P3 | 2 | 4 | 1 | 8 | parser | TODO |
| AX-14 | P3 | 2 | 5 | 1 | 10 | css | TODO |
| SEO-5 | P3 | 2 | 5 | 1 | 10 | seo | TODO |
| BP-1 | P3 | 2 | 5 | 1 | 10 | seo | TODO: dev console CSP error from the Vercel Analytics debug script (Lighthouse Best Practices 92). |
| CI-2 | P3 | 1 | 5 | 1 | 5 | ci | TODO |
| RP-2 | P3 | 1 | 5 | 1 | 5 | repo | TODO |
| A-1 | P3 | 1 | 4 | 2 | 2 | debt | REJECTED for this run: both rankers work. Merging them changes "buy again" output on two pages. |
| A-2 | P3 | 2 | 5 | 1 | 10 | debt | PARKED B-2: hide the units setting, or build imperial output. Product decision. |
| A-3 | P3 | 2 | 3 | 3 | 2 | debt | REJECTED for this run: ESLint 9 flat-config migration belongs in its own PR. |

## Feature proposals

MAX_NEW_FEATURES is 5. Ten proposals, five selected.

| ID | Feature | User problem | Evidence | Scope | Blocker | Selected |
|---|---|---|---|---|---|---|
| N-1 | Add a barcode product to a shop | Barcode page shows a product and stops. | PRD F2 "save to inventory"; barcode page copy promises "Add an item" (UX-2). | Button on the result, picks a shop, posts to the existing items API. | none | yes |
| N-2 | Use-it-up list on Home | Food bought and not marked eaten is forgotten. | PRD user story 5. `consumed` flag already stored. | Pure function over batches: perishable groups, not consumed, bought 2-10 days ago. Card on `/home`. | none | yes |
| N-3 | Download all my data (JSON) | No way to take data out except one CSV per shop. | PRD phase 2 "GDPR data export". Deletion exists, export does not. | `GET /api/account/export`, link in Settings. | none | yes |
| N-4 | Camera barcode scan | Typing 13 digits on a phone. | PRD F2 "Scan product barcode". | `BarcodeDetector` where the browser has it; typed entry stays. | none (progressive) | yes |
| N-5 | Scan first, sign in to save | PRD §5 asks for sign-in after the photo; today sign-in comes first. | PRD §5 flow. | `/scan` public, text lines held in `sessionStorage` across sign-in, sent after. | none | yes |
| N-6 | Push "use it up" reminders | Reminder when not in the app. | PRD §5 day-2 notification. | Web Push. | needs VAPID keys and a sender (B-3) | no |
| N-7 | This shop vs last shop by food group | Trend per group. | Home shows produce change only. | Extra card. | none | no: lower value |
| N-8 | Imperial units output | `units` setting does nothing. | A-2. | Format layer. | decision B-2 | no |
| N-9 | Playwright smoke test | No browser test. | T-1. | Public pages and `/demo`. | none | no: tooling; listed as a toolbox gap |
| N-10 | Share a read as an image | Social proof. | not in the PRD | OG image per batch. | privacy decision | no |
