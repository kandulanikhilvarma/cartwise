# ADR 002 — Receipt as Entry Point (Zero-Friction Pivot)

**Date:** 2026
**Status:** Accepted
**Supersedes:** PRD v1.0 10-feature MVP

---

## Context

PRD v1.0 had 10 MVP features and a 6-question onboarding form before first value.
Health app D30 retention benchmarks are 3% industry average (Business of Apps, 2026).
Manual logging has a 3–5 day abandonment cliff.

## Decision

Receipt scan is the first screen after Google OAuth. No onboarding form. No empty dashboard. 6 features moved to Phase 2.

MVP = 4 features: receipt scan, barcode scan, nutrition summary, Google OAuth.

## Consequences

- UserProfile table removed until Phase 2 (collected passively)
- DailyInsight, FoodLog, Ingredient tables removed until Phase 2
- Claude API and Resend removed from v1 dependencies
- Nutrition calculation is client-side pure function (no extra API call)
- Retention validated at D7/D30 before adding complexity
