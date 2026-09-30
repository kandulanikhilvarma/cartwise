# Blockers

Each open item needs a person. Resume one with `/enhance resume <ID>`.

## Open

| ID | Blocker | Why the run stopped | What you do | Resume |
|---|---|---|---|---|
| B-1 | Signed-in UI not seen | Batch, items, settings, cropper, barcode "add", and the scan-first resume sit behind Google sign-in. The run must not sign in with your account. Code checks pass; the Google handoff (302 to accounts.google.com with the production callback) is checked. | Sign in on https://cartwise-nine.vercel.app. Check: delete a shop (two steps), toggle and undo an item, trim a receipt with the sliders, add a barcode product to a shop, scan while signed out and then sign in. | `/enhance resume B-1` |
| B-3 | Push "use it up" reminders (N-6) | Needs VAPID keys and a sender. The run must not create keys. | Create VAPID keys, add them to the Vercel env, pick a sender (cron or queue). | `/enhance resume B-3` |
| B-5 | Profile README not applied | Push to `kandulanikhilvarma/kandulanikhilvarma` was refused by the permission check. The proposal still matches the live README (no drift, 2026-10-01). | Follow `.enhance/profile-readme/NOTES.md`, or allow the push and ask again. | `/enhance resume B-5` |
| B-8 | "Review dependency changes" check fails | "Dependency review is not supported on this repository". Dependency graph is off. A security setting, so the run does not change it. | Repo Settings → Code security → Dependency graph → Enable. | `/enhance resume B-8` |
| B-9 | Dependabot major bumps (#10 TypeScript 7, #17 Next 16, #18 eslint-config-next 16, #19 @types/node 26, #20 ESLint 10) | Each is a migration, not a patch. STACK_LOCK keeps this run on the current stack. | Pick one migration per PR. Next 16 and ESLint 10 go together. | `/enhance resume B-9` |
| B-10 | Supabase free tier pauses the database | Paused twice (Sep and 2026-09-30); the app loses sign-in and saves until restored. | Upgrade the plan, or add a scheduled ping. Restore from the Supabase dashboard when paused. | `/enhance resume B-10` |

## Closed

| ID | Closed by |
|---|---|
| B-2 | Units picker hidden until imperial output exists (A-2). |
| B-4 | Repo topics set: nextjs, nutrition, ocr, prisma, receipt-scanner, tesseract, typescript. |
| B-6 | vitest 4.1.11, scoped overrides for brace-expansion and js-yaml. `npm audit`: 0. The npm 10 resolver crash was avoided by resolving with npm 11; `npm ci` on npm 10 installs the result. |
| B-7 | `origin` set to `kandulanikhilvarma/cartwise.git`. |
