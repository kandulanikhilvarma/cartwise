# Contributing

Thanks for looking. Cartwise is a small, opinionated codebase — these notes
exist so a change fits it rather than fights it.

## Getting set up

```bash
npm install
cp .env.example .env
npm run dev
```

`DATABASE_URL` is optional for local work: without it the app uses an in-memory
store and everything except persistence behaves the same. `/demo` needs neither
a database nor an account.

## Before you open a pull request

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

CI runs all four. A change that fails any of them will not merge.

## The rules that matter here

**Never fabricate a number.** This is the whole product. If a nutrition source
has no match, the item is `unmatched`. If a receipt line states no weight, the
item stays out of the totals and the coverage line says so. Filling a gap to
make the UI look complete is the one change that will always be rejected.

**Nutrition arrives per 100 g.** Anything that sums those figures without
scaling by `packGrams` is wrong, however reasonable it looks. See
`computeBatchTotals` in `src/features/nutrition/lib/batch-insights.ts`.

**A shop is a week for a household**, not one person's day. References come from
`shopReference(profile)`, never from `RDA` directly.

**Tokens, not literals.** No raw colour or magic pixel value in a component.
Everything resolves through `:root` in `src/app/globals.css`, and every token
has a dark-mode counterpart.

**Tone is never colour alone.** A signal carries a word, a consumed item is
struck through, an unmatched item carries a labelled chip.

**Parser changes need a test.** `src/infrastructure/ocr/receipt-ocr.test.ts` is
the regression net for real receipt shapes. Two bugs that shipped for months —
product names truncated at the last long word, and street addresses parsed as
groceries — would both have been caught by one case each.

## Commits

Conventional commits: `feat:` / `fix:` / `chore:` / `docs:` / `ci:`. Subject
under 60 characters, saying *why* rather than *what*. Use `git commit -F <file>`
for anything with a body.

Please do not add AI co-author trailers or "generated with" footers — they put
bot accounts in the contributor graph.

## Mermaid in the README

GitHub pins an old Mermaid and fails silently. No `&` inside a diagram block —
write `and`. Quote any label containing punctuation. Base diagrams on the real
structure: they double as documentation, so a diagram that flatters the code is
worse than none.

## Reporting a security issue

See [SECURITY.md](SECURITY.md). Please do not open a public issue for anything
involving user data or authentication.
