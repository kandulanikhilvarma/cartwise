# TRD — NutriLens
## Technical Requirements Document · v2.0 · Zero-Friction MVP

> **What changed from v1.0:**
> - Data models stripped to MVP only (no UserProfile, no DailyInsight, no Ingredient tables)
> - Auth: Google OAuth only (no email/password provider)
> - API routes reduced to 4-feature MVP only
> - Removed Resend (no email in v1 — push notifications only)
> - Receipt images deleted after OCR (not stored in Cloudinary permanently)
> - `features/insights`, `features/notifications` moved to Phase 2

---

## 1. Architecture: Modular Monolith (unchanged)

Next.js 15 full-stack. One deployable unit. Modular folders = clean future extraction.

**Decision unchanged:** Solo builder. Less ops = more shipping.

---

## 2. Tech Stack

### Frontend
| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 15** (App Router) | SSR + API routes in one repo |
| Language | **TypeScript** (strict) | Type safety across full stack |
| Styling | **Tailwind CSS v4** | Utility-first, zero CSS files |
| Components | **shadcn/ui** | Accessible, copy-paste, no bundle weight |
| Charts | **Recharts** | Lightweight — used only in nutrition summary |
| State | **TanStack Query** | Server state, caching, background refetch |
| Forms | **React Hook Form + Zod** | Zero re-renders, schema validation |
| Camera | Native `<input capture="environment">` | No lib needed for MVP; barcode uses @zxing/browser |
| Barcode | **@zxing/browser** | Web barcode decoding |

### Backend
| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js 20+ via Next.js API routes | Same runtime as frontend |
| ORM | **Prisma** | Type-safe, migrations included |
| Auth | **NextAuth.js v5** — Google OAuth only | Removed email provider for v1 (friction) |
| Validation | **Zod** | Runtime validation at every API boundary |

> ❌ Resend removed from v1. No email auth, no email notifications. Push only (Phase 2).

### Database
| Layer | Choice | Reason |
|---|---|---|
| Primary | **PostgreSQL** (Neon serverless) | Relational, Prisma-native, free tier |
| Cache | In-memory Map (Phase 2 → Upstash Redis) | Good enough for v1 |
| File Storage | Uploaded file handled in-request | Receipt images are not persisted in v1 |

### AI / Intelligence
| Layer | Choice | Note |
|---|---|---|
| Receipt OCR | **Tesseract.js** | Local OCR pipeline for receipt text extraction in v1 |
| Fallback OCR | Browser/file handling only | Keep the receipt path resilient without extra cloud services |
| Barcode lookup | Open Food Facts API | Free, no key required |

> ❌ Photo food recognition (OpenAI Vision for meals) is Phase 2.
> ❌ Claude API (insight generation) is Phase 2.

### Food Data
| Source | Use |
|---|---|
| **Open Food Facts API** | Barcode lookup (free, global, 3M+ products) |
| **USDA FoodData Central** | Nutritional data for matched products (free, 1M+ items) |

### DevOps (unchanged)
| Layer | Choice |
|---|---|
| Hosting | Vercel |
| DB | Neon (serverless Postgres) |
| CI/CD | GitHub Actions |
| Monitoring | Vercel Analytics + Sentry |
| Secrets | Vercel Environment Variables |

---

## 3. Data Models (MVP only)

```prisma
// User — from Google OAuth
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  image         String?        // Google profile photo
  createdAt     DateTime       @default(now())
  groceries     GroceryBatch[]
  accounts      Account[]
  sessions      Session[]

  // ponytail: no UserProfile table in v1 — collect data passively in Phase 2
}

// GroceryBatch — one shopping trip
model GroceryBatch {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  purchasedAt     DateTime      @default(now())
  storeName       String?
  receiptImageUrl String?       // Cloudinary URL — deleted after OCR (set to null)
  ocrStatus       String        @default("pending") // "pending" | "processing" | "done" | "failed"
  items           GroceryItem[]
  createdAt       DateTime      @default(now())

  @@index([userId, createdAt])
}

// GroceryItem — one product from a batch
model GroceryItem {
  id              String       @id @default(cuid())
  batchId         String
  batch           GroceryBatch @relation(fields: [batchId], references: [id], onDelete: Cascade)
  productName     String       // raw OCR text or barcode product name
  quantity        Float        @default(1)
  unit            String?
  barcodeId       String?
  matchedFoodId   String?      // USDA or Open Food Facts ID
  matchConfidence Float?       // 0–1
  caloriesKcal    Float?
  proteinG        Float?
  carbsG          Float?
  fatG            Float?
  sodiumMg        Float?
  vitaminDMcg     Float?
  ironMg          Float?
  calciumMg       Float?
  consumed        Boolean      @default(false)
  consumedAt      DateTime?

  // ponytail: nutrition flat on item (no join table) — good enough for v1
  // upgrade path: extract FoodNutrition table when Phase 2 food log needs it
}

// NextAuth required tables (boilerplate — do not modify)
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

> **Removed from v1.0:** `UserProfile`, `FoodLog`, `FoodNutrition`, `Ingredient`, `DailyInsight`
> These return in Phase 2 when manual logging and insights are built.

---

## 4. Request Flow (unchanged)

```
Browser → Route (Next.js) → Zod Validation → Application Action
       → Repository (Prisma) → PostgreSQL
       → External Service (OpenAI / USDA / Open Food Facts / Cloudinary)
       → Return DTO → UI Component
```

No business logic in route files. No business logic in UI. Logic lives in `features/[domain]/actions/`.

---

## 5. API Routes (MVP only)

```
# Auth
GET    /api/auth/[...nextauth]    — NextAuth handler (Google OAuth)

# Receipt flow
POST   /api/grocery/receipt       — Upload receipt → OCR → return parsed items (async)
GET    /api/grocery/receipt/:id   — Poll OCR status (pending | done | failed)
GET    /api/grocery              — List user's grocery batches

# Barcode
GET    /api/food-db/barcode/:code — Lookup barcode → Open Food Facts → USDA nutrition

# Grocery inventory
POST   /api/grocery/:batchId/items        — Add item to batch (from barcode or manual fix)
PATCH  /api/grocery/:batchId/items/:id    — Edit item (fix OCR mistake, mark consumed)
DELETE /api/grocery/:batchId/items/:id    — Remove item
```

> ❌ Removed from v1.0: `/api/food-log`, `/api/nutrition/*`, `/api/insights/*`,
> `/api/profile`, `/api/user/export`. These return in Phase 2.

---

## 6. Integration Architecture

### Receipt OCR Flow

```
POST /api/grocery/receipt
  → Validate image (max 10MB, image/*)
  → Upload to Cloudinary (temp folder, auto-delete 24h TTL)
  → Save GroceryBatch { ocrStatus: "processing" }
  → Call OpenAI GPT-4o Vision with receipt prompt
  → Parse JSON response (product name, quantity, price)
  → For each item: search Open Food Facts → fallback USDA → save GroceryItem
  → Update GroceryBatch { ocrStatus: "done" }
  → DELETE Cloudinary image (receipt not stored)
  → Return batchId to client

GET /api/grocery/receipt/:id  (client polls every 2s)
  → Return { status, items } when done
```

**OpenAI receipt prompt (key design — test this first):**
```
Extract all products from this grocery receipt as JSON.
Return: [{ name: string, quantity: number, unit: string | null, pricePerUnit: number | null }]
Return ONLY the JSON array. No explanation.
If a line is not a product (tax, total, store name), skip it.
```

### Barcode Flow

```
GET /api/food-db/barcode/:code
  → Check in-memory cache (TTL 24h)
  → Query Open Food Facts /api/v2/product/:code
  → If not found: return { notFound: true }
  → Map to NutritionDTO { name, brand, caloriesKcal, proteinG, carbsG, fatG, sodiumMg, ... }
  → Cache result
  → Return DTO
```

### Nutrition Summary (client-side calculation for v1)

No separate API for nutrition summary in v1. The client sums `GroceryItem` nutrition fields from the batch response and computes:
- Total calories in the shop
- Sodium flag (> 2300mg daily equivalent)
- Vitamin D flag (0 sources = likely deficient)
- Protein adequacy

```typescript
// ponytail: pure function, no API call, no DB write
// upgrade path: move to server action + DailyInsight table in Phase 2
function computeBatchInsights(items: GroceryItem[]): Insight[] { ... }
```

---

## 7. Security (same as v1.0)

| Layer | Implementation |
|---|---|
| Auth | NextAuth.js v5 — JWT session, PKCE for OAuth |
| Authorization | Every API route checks `session.user.id` against resource |
| Input validation | Zod at every API boundary |
| DB | Prisma parameterised queries only |
| File uploads | Max 10MB; image/* only; Cloudinary auto-moderation |
| Rate limiting | `@upstash/ratelimit` on `/api/grocery/receipt` (3 per minute per user) |
| Receipt privacy | Images deleted from Cloudinary after OCR completes |

---

## 8. Environment Variables (v1 only)

```bash
# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database
DATABASE_URL=          # Neon Postgres

# USDA (nutrition data)
USDA_API_KEY=          # Free at https://fdc.nal.usda.gov/api-guide.html

# Phase 2 (commented out until needed)
# OPENAI_API_KEY=
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Phase 2 (commented out until needed)
# ANTHROPIC_API_KEY=
# RESEND_API_KEY=
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
```

---

## 9. Key Dependencies (v1 only)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^5.0.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.0",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.10.0",
    "openai": "^4.0.0",
    "cloudinary": "^2.0.0",
    "@openfoodfacts/openfoodfacts-nodejs": "^2.0.0",
    "tailwindcss": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "@zxing/browser": "^0.1.4"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "vitest": "^1.0.0"
  }
}
```

> Removed from v1.0: `@anthropic-ai/sdk`, `resend`
> Added in Phase 2 only when the features that need them are built.

---

## 10. Performance Strategy (v1)

| Concern | Strategy |
|---|---|
| Receipt OCR | Async with polling; local OCR parse returns results immediately |
| Barcode lookup | In-memory Map cache, 24h TTL |
| Nutrition calc | Client-side pure function (no extra API call) |
| Images | Uploaded image processed in-request; not persisted in v1 |
| DB queries | Prisma select only needed fields; index on `userId + createdAt` |

---

## 11. Evolution Path

```
Phase 1 (Now): MVP Monolith
  Next.js 15 + Neon + Vercel
  Tesseract.js for receipt OCR
  4 features: receipt scan, barcode, nutrition summary, auth

Phase 2 (After retention validated):
  Add: manual food log, photo AI recognition, ingredient intel
  Add: OpenAI or Claude API for higher-accuracy OCR/insights
  Add: UserProfile table (onboarding collected passively)
  Add: DailyInsight table + background job (Inngest or Trigger.dev)
  Add: Resend for email alerts
  Add: Upstash Redis for caching

Phase 3 (Proven bottleneck only):
  Extract AI pipeline to background worker
  React Native app (shared feature logic)
  Store integrations
```
