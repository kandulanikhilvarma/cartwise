# PRD — NutriLens
## Product Requirements Document · v2.0 · Zero-Friction MVP

> **What changed from v1.0:** MVP reduced from 10 features to 4.
> Receipt scan is now the entry point — not a buried feature.
> Onboarding form removed. Profile collected passively over time.
> 6 features moved to Phase 2 after retention is validated.

---

## 1. Executive Summary

**Product Name:** NutriLens
**Tagline:** *Snap your receipt. Know what you bought. Know what it does.*
**Type:** Web-first, mobile-responsive (camera access required)
**Architecture:** Modular monolith → extract only proven bottlenecks

NutriLens links grocery purchases to nutritional intelligence. The entry point is a receipt photo. The first value delivery is within 30 seconds of signup: "Your shop is high sodium. You bought 0 sources of Vitamin D."

The core differentiator: **receipt as passive food inventory** — the only logging that doesn't require daily effort.

---

## 2. The One Problem We're Solving in v1

> Health apps die because logging is too much work. 97% of users are gone by day 30.
> Manual food logging has a 3–5 day cliff. Wearables survive because data is passive.
> **Receipt scan is our passive equivalent.** This is the only bet in v1.

Everything else — ingredient intelligence, deficiency alerts, pattern insights, manual logging — is Phase 2, contingent on proving this bet with real users.

---

## 3. Target Users (Same, narrowed focus)

**Primary — Grocery shoppers who buy the same things weekly**
- They have receipts. They shop regularly. Receipt scan gives them data automatically.
- NOT: people who eat out mostly, people who don't keep receipts

**Secondary (Phase 2)** — Biohackers, people managing health conditions, B2B nutritionists

---

## 4. MVP Features — Phase 1 (Build Only These)

### F1 — Receipt Scan (Core, Day 1)
- User opens app → first screen is camera
- Photo of grocery receipt → OCR extracts items → auto-matched to food database
- Processing happens in background. No item-by-item confirmation screen.
- Result: grocery inventory with estimated nutritional profile
- User can edit/remove items if match is wrong (secondary action, not required)

### F2 — Barcode Scan
- Scan product barcode → Open Food Facts lookup → save to inventory
- Used when a product didn't parse from receipt, or for single-item adds
- Result: product added to today's log

### F3 — Nutrition Summary (Simple)
- Shows nutritional profile of the scanned shop/products
- 3 insights maximum on first load: one high concern, one deficiency, one positive
- No complex dashboard on day 1 — one card, three lines
- Expands to full macro/micro breakdown on tap

### F4 — Auth (Google OAuth only)
- Google OAuth sign-in, no email/password in v1
- No onboarding form. Name and avatar pulled from Google.
- No profile questions asked until they trigger a feature that needs them
  (e.g., calorie target shown only after they've scanned 3 receipts)

---

## 5. The Zero-Friction User Flow

```
Open app (anonymous)
  → "Scan your grocery receipt to get started"
  → Camera opens
  → Photo taken
  → "Sign in to save your results" [Google OAuth — 1 tap]
  → Processing screen (5–10s) — show what's being matched
  → Results: 3 insight cards + full grocery list
  → Day 2 push notification: "You bought spinach 4 days ago — still haven't eaten it"
```

**What we do NOT do in v1:**
- Ask for age, weight, height, goals before showing value
- Make user confirm every OCR item before saving
- Show an empty dashboard on first login
- Ask users to manually log meals

---

## 6. Feature Roadmap

### Phase 1 — Zero-Friction Core (Build Now)
- F1 Receipt scan (OCR → auto-inventory)
- F2 Barcode scan (single item add)
- F3 Nutrition summary (3 insights → expandable)
- F4 Auth (Google OAuth only)

### Phase 2 — Depth (After retention validated)
- Manual food log (search + entry)
- Photo AI food recognition (OpenAI Vision)
- Ingredient intelligence (additive flags, plain-language explanations)
- Deficiency alerts (push/email when consistently low)
- Pattern insights (Claude API: "You drink Coke 3x on Tuesdays")
- User profile + calorie targets (collected after 3 receipt scans)
- GDPR data export + account deletion

### Phase 3 — Scale
- Nutritionist B2B dashboard
- Store API integrations (where open APIs exist)
- Fitness tracker integration (Whoop, Apple Health)
- Supplement tracking
- Household / family tracking

---

## 7. User Stories (v1 only)

```
AS A user,
I WANT to scan my grocery receipt immediately after signing up
SO THAT I get value before I've had to fill out any form

AS A user,
I WANT the app to process my receipt automatically
SO THAT I don't have to confirm every item one by one

AS A user,
I WANT to see 3 clear insights about my shop
SO THAT I understand what I bought at a glance

AS A user,
I WANT to scan a barcode when a product isn't on my receipt
SO THAT I can add single items without manual typing

AS A user,
I WANT to be reminded about food I bought but haven't consumed
SO THAT I have a reason to open the app daily
```

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Receipt OCR result < 10s; Barcode lookup < 2s |
| **Mobile** | Camera access required; touch-optimised scan UI; no desktop-first assumptions |
| **Accuracy** | OCR match confidence shown; wrong matches editable (not blocking) |
| **Privacy** | Receipt images not stored permanently; deleted after OCR processing |
| **Security** | Google OAuth only; Prisma parameterised queries |
| **Accessibility** | WCAG 2.1 AA — camera fallback to file upload for accessibility |

---

## 9. Success Metrics (90 days)

| Metric | Target | Why |
|---|---|---|
| Registered users | 200 | Lower bar — quality over quantity in v1 |
| Receipt scans per user (first week) | ≥ 2 | Proves the core loop works |
| D7 retention | ≥ 25% | Industry baseline for a product with real value |
| D30 retention | ≥ 10% | Above health app average (3%) = we're doing something right |
| DAU/MAU | > 20% | Means users return without needing to log manually |
| NPS | ≥ 35 | |

> Note: v1.0 PRD targeted 500 users at 90 days with DAU/MAU > 30%.
> These targets are more honest given health app benchmarks (3% D30 industry avg).
> Prove retention first. Scale second.

---

## 10. Out of Scope (v1)

- Manual food entry / meal logging
- Photo food recognition (AI)
- Ingredient-level breakdown / additive flagging
- Deficiency alerts and notifications
- Pattern insights and weekly reports
- User profile form (age, weight, goals)
- Calorie / macro targets
- Email auth (Google OAuth only)
- GDPR export / account deletion
- Native iOS/Android app
- Any Phase 2 or Phase 3 features
