# NutriLens — Folder Structure + GitHub Copilot Step 1
## v2.0 · Zero-Friction MVP · 4 features only

> **Changed from v1.0:**
> - `features/insights` → Phase 2 (removed from scaffold)
> - `features/notifications` → Phase 2 (removed from scaffold)
> - `features/integrations` → Phase 2 (removed from scaffold)
> - `features/food-log` → Phase 2 (no manual log in v1)
> - `features/nutrition` → simplified (client-side only in v1)
> - Auth: Google OAuth only (no email routes)
> - Onboarding page removed (no profile form)
> - API routes trimmed to match TRD v2.0

---

## PART 1 — Folder Structure

```
nutrilens/
│
├── src/
│   │
│   ├── app/                               ← Next.js App Router (thin adapters only)
│   │   ├── layout.tsx                     ← root layout: providers, fonts
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   │
│   │   ├── (auth)/                        ← unauthenticated
│   │   │   └── login/
│   │   │       └── page.tsx               ← Google Sign-In button only
│   │   │
│   │   ├── (app)/                         ← protected (require session)
│   │   │   ├── layout.tsx                 ← app shell: minimal nav
│   │   │   ├── scan/
│   │   │   │   └── page.tsx               ← entry point: camera opens immediately
│   │   │   ├── grocery/
│   │   │   │   ├── page.tsx               ← list of grocery batches
│   │   │   │   └── [batchId]/
│   │   │   │       └── page.tsx           ← single batch: items + nutrition summary
│   │   │   └── barcode/
│   │   │       └── page.tsx               ← barcode scanner + result
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       ├── grocery/
│   │       │   ├── route.ts               ← GET (list batches)
│   │       │   ├── receipt/
│   │       │   │   └── route.ts           ← POST: upload receipt → OCR
│   │       │   └── [batchId]/
│   │       │       ├── route.ts           ← GET: batch + items
│   │       │       └── items/
│   │       │           ├── route.ts       ← POST: add item to batch
│   │       │           └── [itemId]/
│   │       │               └── route.ts   ← PATCH (edit/mark consumed), DELETE
│   │       └── food-db/
│   │           └── barcode/
│   │               └── [code]/
│   │                   └── route.ts       ← GET: Open Food Facts + USDA lookup
│   │
│   │
│   ├── features/                          ← domain modules
│   │   │
│   │   ├── auth/
│   │   │   ├── actions/
│   │   │   │   └── getSession.ts          ← thin wrapper around NextAuth getServerSession
│   │   │   ├── components/
│   │   │   │   └── SignInButton.tsx        ← Google OAuth button
│   │   │   └── types.ts
│   │   │
│   │   ├── grocery/                       ← CORE: receipt scan + inventory
│   │   │   ├── actions/
│   │   │   │   ├── createBatch.ts         ← POST receipt image → start OCR
│   │   │   │   ├── getBatch.ts            ← GET batch + items
│   │   │   │   ├── getBatches.ts          ← GET all batches for user
│   │   │   │   ├── updateItem.ts          ← PATCH: edit item, mark consumed
│   │   │   │   └── deleteItem.ts
│   │   │   ├── components/
│   │   │   │   ├── ReceiptUploader.tsx    ← camera capture + file fallback
│   │   │   │   ├── OcrStatusPoller.tsx    ← polls /api/grocery/receipt/:id every 2s
│   │   │   │   ├── GroceryBatchCard.tsx   ← single trip summary card
│   │   │   │   ├── GroceryItemRow.tsx     ← item: name, nutrition, consumed toggle
│   │   │   │   └── BatchList.tsx          ← list of past grocery batches
│   │   │   ├── hooks/
│   │   │   │   ├── useGroceryBatch.ts     ← TanStack Query: fetch single batch
│   │   │   │   └── useGroceryBatches.ts   ← TanStack Query: fetch all batches
│   │   │   └── types.ts
│   │   │
│   │   ├── scanner/                       ← camera + barcode (shared scan UI)
│   │   │   ├── actions/
│   │   │   │   └── lookupBarcode.ts       ← Open Food Facts → USDA → NutritionDTO
│   │   │   ├── components/
│   │   │   │   ├── CameraCapture.tsx      ← <input capture="environment"> + preview
│   │   │   │   ├── BarcodeReader.tsx      ← @zxing/browser scanner
│   │   │   │   └── ScanResultCard.tsx     ← show matched product for confirmation
│   │   │   └── types.ts
│   │   │
│   │   └── nutrition/                     ← client-side calculation only in v1
│   │       ├── lib/
│   │       │   ├── rda-constants.ts       ← RDA values (Vitamin D, Iron, Sodium, etc.)
│   │       │   └── batch-insights.ts      ← pure fn: GroceryItem[] → Insight[]
│   │       ├── components/
│   │       │   ├── InsightCard.tsx        ← single insight: icon + message
│   │       │   └── NutritionSummary.tsx   ← 3 top insights + expandable full breakdown
│   │       └── types.ts
│   │   
│   │   # Phase 2 folders (do not create now — scaffold when features are built)
│   │   # features/food-log/
│   │   # features/insights/
│   │   # features/notifications/
│   │
│   │
│   ├── shared/
│   │   ├── ui/                            ← shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── toast.tsx
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   └── useMediaQuery.ts           ← detect mobile for camera UI
│   │   ├── lib/
│   │   │   ├── utils.ts                   ← cn() helper
│   │   │   ├── date.ts                    ← date formatting
│   │   │   └── validators/
│   │   │       └── schemas.ts             ← shared Zod schemas
│   │   ├── config/
│   │   │   └── constants.ts               ← MAX_UPLOAD_SIZE, ACCEPTED_IMAGE_TYPES, etc.
│   │   └── types/
│   │       └── index.ts                   ← ApiError, ActionResult<T>, Maybe<T>
│   │
│   │
│   └── infrastructure/
│       ├── db/
│       │   └── client.ts                  ← Prisma singleton
│       ├── repositories/
│       │   ├── grocery.repo.ts            ← all Prisma queries for GroceryBatch + GroceryItem
│       │   └── user.repo.ts               ← User queries (find by id/email)
│       ├── services/
│       │   ├── openai.service.ts          ← GPT-4o Vision: receipt OCR only (v1)
│       │   ├── food-db.service.ts         ← Open Food Facts + USDA lookup
│       │   └── cloudinary.service.ts      ← upload + delete (temp receipt storage)
│       └── cache/
│           └── index.ts                   ← in-memory Map cache (barcode results)
│
│
├── db/
│   ├── migrations/
│   ├── schema.prisma                      ← source of truth (v2 models only)
│   └── seed.ts                            ← dev seed: 1 user, 1 batch, 5 items
│
├── docs/
│   ├── PRD_v2.md
│   ├── TRD_v2.md
│   └── adr/
│       ├── 001-modular-monolith.md
│       └── 002-receipt-as-entry-point.md  ← documents the zero-friction pivot
│
├── tests/
│   ├── unit/
│   │   ├── batch-insights.test.ts         ← pure function: test insight calc
│   │   └── barcode-lookup.test.ts
│   └── e2e/
│       └── receipt-scan-flow.spec.ts      ← Playwright: signup → scan → see insight
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── README.md
└── .github/
    └── workflows/
        └── deploy.yml                     ← lint → test → vercel deploy
```

---

## PART 2 — GitHub Copilot Chat Prompt (Paste in VSCode)

> Open VSCode → GitHub Copilot Chat (Ctrl+Shift+I) → paste below

```
I'm building NutriLens — a grocery receipt scanning app using Next.js 15 (App Router), TypeScript strict, Tailwind CSS v4, Prisma, and PostgreSQL (Neon).

MVP is 4 features only: receipt OCR, barcode scan, nutrition summary, Google OAuth.
No manual food log, no email auth, no onboarding form.

Please scaffold the project with these exact steps:

STEP 1 — Initialize Next.js:
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

STEP 2 — Install dependencies:
npm install @prisma/client next-auth@beta zod react-hook-form @hookform/resolvers @tanstack/react-query recharts openai cloudinary @openfoodfacts/openfoodfacts-nodejs class-variance-authority clsx tailwind-merge @zxing/browser

npm install -D prisma @types/node vitest @playwright/test

STEP 3 — Initialize Prisma:
npx prisma init --datasource-provider postgresql

STEP 4 — Create folder structure under src/:

Create these directories (with .gitkeep files):
- src/features/auth/actions/
- src/features/auth/components/
- src/features/grocery/actions/
- src/features/grocery/components/
- src/features/grocery/hooks/
- src/features/scanner/actions/
- src/features/scanner/components/
- src/features/nutrition/lib/
- src/features/nutrition/components/
- src/shared/ui/
- src/shared/hooks/
- src/shared/lib/validators/
- src/shared/config/
- src/shared/types/
- src/infrastructure/db/
- src/infrastructure/repositories/
- src/infrastructure/services/
- src/infrastructure/cache/
- db/migrations/
- docs/adr/
- tests/unit/
- tests/e2e/

STEP 5 — Create src/infrastructure/db/client.ts:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

STEP 6 — Create src/infrastructure/cache/index.ts:
```typescript
// ponytail: in-memory cache — swap to Upstash Redis in Phase 2
const cache = new Map<string, { value: unknown; expiresAt: number }>()

export function cacheGet<T>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() > item.expiresAt) { cache.delete(key); return null }
  return item.value as T
}

export function cacheSet(key: string, value: unknown, ttlSeconds = 86400): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export function cacheDelete(key: string): void {
  cache.delete(key)
}
```

STEP 7 — Create src/shared/types/index.ts:
```typescript
export type ApiError = { message: string; code?: string; status: number }
export type ActionResult<T> = { success: true; data: T } | { success: false; error: string }
export type Maybe<T> = T | null | undefined
```

STEP 8 — Create src/shared/lib/utils.ts:
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
```

STEP 9 — Create src/shared/config/constants.ts:
```typescript
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const BARCODE_CACHE_TTL_SECONDS = 86400 // 24h
export const OCR_POLL_INTERVAL_MS = 2000 // poll every 2s
export const OCR_RATE_LIMIT_PER_MINUTE = 3
export const APP_NAME = 'NutriLens'
```

STEP 10 — Create src/features/nutrition/lib/rda-constants.ts:
```typescript
// RDA values — adult average (customise in Phase 2 when UserProfile exists)
export const RDA = {
  caloriesKcal: 2000,
  proteinG: 50,
  carbsG: 275,
  fatG: 78,
  sodiumMg: 2300,   // Upper limit (not target)
  vitaminDMcg: 15,
  ironMg: 18,
  calciumMg: 1000,
} as const

export type NutrientKey = keyof typeof RDA
```

STEP 11 — Create .env.example:
```
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=
OPENAI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
USDA_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
# Phase 2 — uncomment when needed:
# ANTHROPIC_API_KEY=
# RESEND_API_KEY=
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
```

STEP 12 — Create docs/adr/001-modular-monolith.md and docs/adr/002-receipt-as-entry-point.md as empty files with placeholder content.

After all steps, show me:
1. The directory tree of src/
2. Confirm packages installed
3. List which .env values I must fill in before running Step 2 (Prisma schema)
```

---

## PART 3 — Build Order After Scaffold

| Step | What | Key decisions |
|---|---|---|
| **Step 1** | ✅ Scaffold (this doc) | Folder structure above |
| **Step 2** | Prisma schema | Use TRD v2.0 models: User, GroceryBatch, GroceryItem + NextAuth tables |
| **Step 3** | Google OAuth | NextAuth v5, no email provider, protect `(app)` routes |
| **Step 4** | Receipt upload UI | Mobile-first camera, `<input capture="environment">`, upload to `/api/grocery/receipt` |
| **Step 5** | OpenAI OCR service | `infrastructure/services/openai.service.ts`, receipt prompt, JSON parse |
| **Step 6** | OCR polling | `OcrStatusPoller.tsx` → `GET /api/grocery/receipt/:id` every 2s |
| **Step 7** | Grocery item display | `GroceryItemRow`, mark consumed, edit match |
| **Step 8** | Nutrition summary | Pure function in `batch-insights.ts`, `NutritionSummary` component |
| **Step 9** | Barcode scan | `@zxing/browser`, `BarcodeReader.tsx`, `/api/food-db/barcode/:code` |
| **Step 10** | Push notifications | Day-2 retention hook: "you bought X, haven't eaten it" |

---

## PART 4 — Skills to Use (ordered by when you need them)

| When | Skill | What it helps with |
|---|---|---|
| Every prompt | `/ponytail` | Shortest code. No boilerplate. YAGNI enforced. |
| Every prompt | `clean-code` | SRP, naming, no 100-line functions |
| Step 4 (camera UI) | `mobile-design` | Camera touch UX, mobile-first component decisions |
| Step 4–9 (components) | `senior-frontend` | React Hook Form, TanStack Query patterns |
| Step 5 (OCR service) | `senior-architect` | Service layer structure, error handling |
| Any component | `ui-ux-pro-max` | shadcn/ui composition, scan result UI |
| Before every commit | `code-reviewer` | Catch broken imports, missing types |
