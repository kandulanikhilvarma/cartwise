# Blockers

Each item needs a person. The run did not do these. Resume one with `/enhance resume <ID>`.

| ID | Blocker | Why the run stopped | What you do | Resume |
|---|---|---|---|---|
| B-1 | Signed-in UI not seen | Batch, items, settings, cropper, barcode "add", and the scan-first resume sit behind Google sign-in. The run must not sign in with your account. Code checks (tsc, lint, tests, build) pass. | Sign in on a preview deploy or `npm run dev`. Check: delete a shop (two steps), toggle and undo an item, trim a receipt with the sliders, add a barcode product to a shop, scan while signed out and then sign in. | `/enhance resume B-1` |
| B-2 | Units setting does nothing (A-2) | Product decision: hide the setting, or build imperial output. | Pick one. | `/enhance resume B-2` |
| B-3 | Push "use it up" reminders (N-6) | Needs VAPID keys and a sender. The run must not create keys or accounts. | Create VAPID keys, add them to the env, pick a sender (cron or queue). | `/enhance resume B-3` |
| B-4 | GitHub repo description and topics | A public metadata change. | Set a description, for example "Snap a grocery receipt, get a nutrition read of the whole shop", and topics: `nextjs`, `nutrition`, `ocr`, `receipt-scanner`, `prisma`, `tesseract`. | `/enhance resume B-4` |
| B-5 | Profile README not applied | The run must not push to `kandulanikhilvarma/kandulanikhilvarma`. | Follow `.enhance/profile-readme/NOTES.md`. | `/enhance resume B-5` |
| B-6 | 5 dev-only npm advisories | `npm audit fix` crashes with "Cannot read properties of null (reading 'edgesOut')" (npm bug with `overrides`). The fixes need a vitest upgrade and the ESLint 9 move (A-3), each its own PR. | Approve a vitest upgrade PR and an ESLint 9 PR. | `/enhance resume B-6` |
| B-7 | Local remote uses the old repo name | `origin` is `kandulanikhilvarma/foodlens.git`. GitHub redirects, so nothing breaks. | Optional: `git remote set-url origin https://github.com/kandulanikhilvarma/cartwise.git` | `/enhance resume B-7` |
