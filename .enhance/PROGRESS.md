# Progress

Resume from this file and `BACKLOG.md`. Branch `enhance/2026-09-29`.

## Done (commit, check)

| Backlog IDs | Commit | Check |
|---|---|---|
| S-1, S-10 | `8d0f897` | `npm audit --omit=dev`: 0; 57 tests; build green |
| S-2, R-1 | `430105b` | `curl /api/health` → `{"ok":false,"db":"error"}` 503, no host |
| C-14, C-15, S-5 | `1d1df16` | `barcode.test.ts`; `/barcode/123` → 400; `0123456789012` now real OFF data |
| S-3 | `897eee9` | fixed copy in receipt 500 and error boundary |
| S-4 | `4d1c73d` | tsc; typed checks per field |
| S-6 | `4c52e52` | `batch-store.test.ts` |
| S-7 | `98d6a21` | `rate-limit.test.ts` |
| S-8 | `bab32b4` | tsc |
| S-9 | `a19459a` | — |
| C-1..C-7 (parse), C-16, C-17 (detect) | `7e8e27f` | `receipt-layouts.test.ts` (10 cases); `/demo` still 12 lines |
| C-8, C-9, C-10, C-17 (history) | `2150bc9` | `batch-honesty.test.ts`, `history.test.ts` |
| PF-2 | `605af6c` | — (build check in phase 6) |

Tests: 57 → 80.

## Next

Client group (UX-1, C-11 client, C-12, C-13, C-7 display, UX-3..6, AX-8/9/11/12), then PF-1, CSS/a11y, SEO, CI, features N-1..N-5, README, profile README, phase 6.

## Session notes

- A pre-edit hook ("Fact-Forcing Gate") asks for facts on the first edit of each file. It slows the run but does not block it.
