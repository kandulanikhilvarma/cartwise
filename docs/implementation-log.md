# Implementation Log

## Purpose
Keep a short, readable record of what changed, why it changed, and how to reproduce or extend it.

## Current State
- Next.js 15 scaffold is in place.
- Public landing page exists.
- Route groups exist for app and auth surfaces.
- Receipt upload flow exists and uses a shared in-memory batch store.
- Receipt processing now has a `processing` state and polling endpoint.
- Batch list and batch detail read from the same store.
- Grocery items can be marked consumed and the batch UI shows that state.
- Barcode lookup now returns a product for known codes.
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

## How to Extend
- Add one small change at a time.
- Update this file after each meaningful feature or structural change.
- Keep the entry format: date, change, result, verification.
- If a change touches routes, note the endpoint names.
- If a change adds UI, note the component names.
- If a change affects data flow, note the store or service used.
- Keep each entry short enough that someone can reproduce the change without reading the whole codebase.
