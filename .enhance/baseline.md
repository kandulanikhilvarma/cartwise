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
