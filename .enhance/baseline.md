# Baseline (before)

Date: 2026-09-29. Branch: `enhance/2026-09-29`, cut from `main` at `958d621`.
Machine: Windows 11, Node 22.22.0, npm 10.9.4. CI uses Node 20.

| Step | Command | Result | Time |
|---|---|---|---|
| Install | `npm ci` | pass (6 deprecation warnings: eslint 8, glob 7, rimraf 3, inflight) | 118 s |
| Lint | `npm run lint` | pass, 0 warnings | 83 s |
| Type check | `npx tsc --noEmit` | pass | 20 s |
| Tests | `npm test` | pass, 4 files, 57 tests | 24 s |
| Build | `npm run build` | pass, 2 Edge-runtime warnings (jose via next-auth) | 168 s |
| Audit (prod deps) | `npm audit --omit=dev` | 6 vulnerabilities: 3 high, 3 critical | — |
| Audit (all deps) | `npm audit` | 11 vulnerabilities: 3 moderate, 5 high, 3 critical | — |

## Build output

- Next.js 15.5.19. 28 routes.
- First Load JS shared by all: 102 kB. Middleware: 88.2 kB.
- Largest pages: `/scan` 3.96 kB (114 kB first load), `/grocery/[batchId]` 4.3 kB (111 kB), `/` 114 kB.
- Static (`○`): 5 routes, all metadata files (`/icon.svg`, `/manifest.webmanifest`, `/opengraph-image`, `/robots.txt`, `/sitemap.xml`).
- Dynamic (`ƒ`): every page, including the marketing pages `/`, `/about`, `/faq`, `/how-it-works`, `/contact`, `/privacy`, `/terms`.
- During "Generating static pages", the build made 12 `prisma.foodMatch.findUnique()` calls to an unreachable database (`/demo` prerender attempt). Each logged `Can't reach database server`.

## Audit findings (prod dependencies)

- `postcss <=8.5.22` (high): 4 advisories. Fix available.
- `sharp <=0.35.4-rc.0` (high): libvips and libheif advisories. Fix available.
- 3 critical entries (details in `.enhance/AUDIT_REPORT.md`).

Raw logs are in the session scratchpad, not in the repo.

# After

Date: 2026-09-30. Head of `enhance/2026-09-29`. Clean `npm ci`, then each step. All exit 0.

| Metric | Before | After |
|---|---|---|
| `npm ci` | 118 s | 102 s |
| `npm run lint` | pass, 83 s | pass, 58 s |
| Type check | pass, 20 s | pass, 9 s (`npm run typecheck`) |
| Tests | 57 tests, 4 files | 83 tests, 10 files |
| Coverage (statements, all of `src`) | not measured (77.5% counted 4 files only) | 41.77% (branches 35.12%, functions 49.53%) |
| Build | pass, 2 Edge-runtime warnings | pass, 0 warnings |
| Static routes (`○`) | 5 | 13 |
| DB calls during build | 12 | 0 |
| First Load JS shared | 102 kB | 103 kB |
| Middleware | 88.2 kB | 88.1 kB |
| `npm audit --omit=dev` | 6 (3 high, 3 critical) | 0 |
| `npm audit` | 11 (3 moderate, 5 high, 3 critical) | 5 (3 moderate, 2 high), dev only (B-6) |
| Lighthouse a11y (mobile, dev) | 100 | 100 |
| Lighthouse Best Practices `/`, `/faq`, `/login` | 92 | 100 |
| Lighthouse SEO `/` / `/faq` (dev) | 100 / 100 | 92 / 91 (note 1) |
| Lighthouse SEO `/login` | 91 | 63 (note 2) |

Note 1: in dev, Next 15 streams metadata into `<body>`, and Lighthouse reads the description as missing. The production build has title, description and canonical in `<head>` on `/`, `/faq`, `/about` and `/privacy` (checked in the prerendered HTML).

Note 2: `/login` is now `noindex` on purpose. The `is-crawlable` audit fails by design.

## Scores (after)

| Dimension | Before | After | Reason |
|---|---|---|---|
| Correctness | 4 | 7 | Parser reads 10 real till layouts. No invented barcode products. Signed-in flows not run (B-1). |
| Security | 4 | 8 | Prod audit 0. Health route shows no host. Google needs a verified email. CSV guard. 5 dev advisories remain. |
| Performance | 6 | 8 | 13 static routes. No DB at build. Paging (PF-3) not done. |
| Reliability | 6 | 7 | Barcode timeout, undo keeps the item, rate-limit expiry in the same request. |
| Tests | 4 | 6 | 83 tests. Honest coverage 41.77%. No browser test. |
| CI/DX | 6 | 7 | Node 22, typecheck script, coverage script. |
| Architecture | 7 | 7 | No structural change. Two rankers remain (A-1). |
| Accessibility | 5 | 8 | Keyboard crop, 5 contrast fixes, skip links, landmarks, aria-current. App screens not audited signed in. |
| UX and content | 6 | 8 | Confirmed delete, clear errors, add from barcode, use-it-up, scan first. |
| Visual design | 6 | 7 | Motion and photo tokens, `color-scheme`. 61 raw font sizes remain (VD-2). |
| SEO | 4 | 8 | Per-page titles, canonicals, JSON-LD, sitemap. |
| Repo presentation | 7 | 8 | CI badge, feature rows, scripts. Profile proposal ready (B-5). |
| Production readiness | 6 | 7 | Data export, quieter errors. Signed-in smoke test still open. |

Screens: `.enhance/screens/after/` (home, demo, faq, scan at 1440 px; home, login, scan at 390 px).
