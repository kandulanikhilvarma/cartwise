# FoodLens

FoodLens is the working repo for NutriLens, a receipt-first grocery nutrition app.

## Current focus
- Public value-first landing page
- Receipt upload flow
- Grocery batch pages
- Barcode fallback
- Simple nutrition summary
- Google OAuth later in the flow

## Status
- Next.js 15 scaffold is in place
- Route groups exist for app and auth surfaces
- Mock receipt upload flow is wired
- Prisma schema is present
- Build currently passes

## Structure
- `src/app/` - routes and pages
- `src/features/` - domain features
- `src/shared/` - shared UI, config, and helpers
- `src/infrastructure/` - db, cache, and services
- `prisma/` - schema and migrations
- `docs/` - specs and notes
- `tests/` - unit and e2e tests

## Run
```bash
npm install
npm run dev
npm run build
```

## Working rules
- Use `ponytail` by default for implementation work
- Keep code minimal and avoid extra abstractions
- When asked for a review, switch to code-review mode
- In review mode, focus on bugs, regressions, and missing tests

## Source of truth
- `PRD_NutriLens_v2.md`
- `TRD_NutriLens_v2.md`
- `ADR_002_receipt_entry_point.md`