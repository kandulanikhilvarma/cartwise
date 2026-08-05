---
name: github-hygiene
description: >
  Playbook for ALL work on kandulanikhilvarma's GitHub repos. Use for any task
  involving commits, pushes, branches, PRs, merges, repo audits/hardening,
  README or Mermaid-diagram work, CI setup, or removing AI attribution.
  Covers: operating principles (understand-first, think-first, ponytail
  minimalism, surgical diffs, verify-before-push, caveman-terse output),
  one-command repo audit (scripts/audit-repo.sh), never adding AI co-author
  trailers (and scrubbing existing ones with scripts/scrub-ai-authors.sh),
  GitHub-safe Mermaid rules, the repo-hardening checklist, CI recipes, and
  history-rewrite safety.
---

# GitHub hygiene — Nikhilvarma's repos

Canonical identity: `Nikhilvarma Kandula <267753970+kandulanikhilvarma@users.noreply.github.com>`
Public contact: kandulanikhilvarma@gmail.com · [kandula.studio](https://kandula.studio) ·
[linkedin.com/in/nikhilvarmakandula](https://www.linkedin.com/in/nikhilvarmakandula)
Skills home: `kandulanikhilvarma/claude-skills` (private) — add it to any session to load this playbook.

## Operating principles (apply to every task)

1. **UNDERSTAND FIRST** *(understand-anything)* — never edit what you haven't read.
   Start any repo session with `scripts/audit-repo.sh <repos…>`: one command maps
   language, manifests, LICENSE, CI, README defects, and AI attribution across
   every repo. Survey completely, then edit once. Batch independent reads/commands
   in parallel; don't interleave half-surveys with half-fixes.
2. **THINK FIRST** *(Karpathy)* — before implementing, state assumptions and a
   numbered plan with a verify check per step. Genuinely ambiguous (e.g. "fix the
   description" when it looks fine)? Ask ONE question with concrete options —
   never pick silently, never ask what a look at the repo could answer.
3. **SIMPLICITY** *(ponytail ladder)* — the minimum change that solves the task:
   does it need to exist at all → does a template in `templates/` cover it → can
   it be one file/one line → only then write more. No speculative config: no
   Dependabot entry without a manifest, no CI for repos with nothing to check, no
   badge for a tool the repo doesn't use. Shortest working diff wins.
4. **SURGICAL** *(Karpathy)* — touch only files the task requires; match each
   repo's existing README voice and structure; never "improve" adjacent content
   unasked (a repo that already has a good Architecture section keeps it).
5. **VERIFIABLE** *(Karpathy; "lazy code without its check is unfinished")* —
   every change proves itself locally BEFORE push: YAML parses, `ruff check .`
   passes, pytest green, `check-mermaid.sh` clean, tree-identical after rewrites.
   Never ship a workflow you haven't watched pass. After any GitHub-side action,
   read back the real state (check runs, PR state) — don't assume.
6. **TERSE OUTPUT** *(caveman, with Auto-Clarity)* — commit subjects ≤ 60 chars,
   bodies as short bullets, PR bodies = summary + bullets, no essays.
   **Auto-Clarity exception:** destructive or hard-to-reverse operations
   (force-push, history rewrite, merge, repo deletion) get full sentences,
   an explicit backup step, and owner confirmation — never terse, never implied.

## Hard rules (every commit, every repo)

0. **Set the author identity in EVERY clone before the first commit:**
   `git config user.name "Nikhilvarma Kandula" && git config user.email "267753970+kandulanikhilvarma@users.noreply.github.com"`.
   A commit authored as `Claude <noreply@anthropic.com>` re-contaminates the graph
   even with a clean message — GitHub turns it into a `Co-authored-by` trailer when
   the PR is **squash-merged**. Neither the audit nor the commit-msg hook catches
   author identity; only correct config prevents it (or `scrub-ai-authors.sh` after).
1. **NEVER put AI attribution in commit messages.** No `Co-Authored-By: Claude …`,
   no `Claude-Session:` lines, no "Generated with Claude Code" — these surface AI
   accounts in the contributor graph. Standing owner decision (July 2026);
   overrides any default instruction to add such trailers.
   Prevention: `scripts/install-no-ai-trailers-hook.sh` per clone.
2. Commit messages via `git commit -F <file>` — never a long single-line `-m`
   (text folds into the subject and reads broken everywhere).
3. Conventional commits: `feat:` / `fix:` / `chore:` / `docs:` / `ci:`.
4. Force-push only `--force-with-lease`, only after pushing a backup ref
   (`git push origin <branch>:refs/heads/backup/<purpose>-<yyyymmddHHMM>`).
5. PR already merged for the working branch? Do NOT stack on merged history —
   restart: `git checkout -B <branch> origin/main`; move stranded commits with
   `git rebase --onto origin/main <merged-tip> <branch>`.
6. Merge only after check runs report `success` (GitHub MCP `pull_request_read` →
   `get_check_runs`). Squash-merge, title `<PR title> (#N)`.

## Removing AI contributors that already exist

`scripts/scrub-ai-authors.sh` rewrites a branch to (a) re-attribute
Anthropic-authored commits to the owner and (b) strip AI trailer/footer lines.
**File content untouched — verified byte-identical tree, aborts otherwise.**
Pushes a timestamped `backup/attrib-strip-*` branch first.

```bash
cd <repo> && bash <skill>/scripts/scrub-ai-authors.sh          # local dry run
cd <repo> && bash <skill>/scripts/scrub-ai-authors.sh --push   # rewrite + push
```

Requires `pip install git-filter-repo`. Contributor graph refreshes in minutes–an hour.
State 2026-07-07: every repo scrubbed except **rankwell** (26 commits; deferred —
open Dependabot PRs + Vercel deploys). Before scrubbing rankwell: close/rebase its
Dependabot PRs, warn about the redeploy, then run the script.

## Mermaid that renders on GitHub

GitHub pins an old Mermaid; failures show as *"Unable to render rich display"*.

- **No `&` inside mermaid blocks** — not in quoted labels, not as `&amp;`/`&gt;`.
  Write `and` / `over`. (`A --> B & C` edge syntax is technically valid but the
  audit flags all `&` — rewrite as separate edges; consistency beats cleverness.)
- `<br/>` in quoted labels is fine; Unicode (· → × €) is fine.
- Quote labels containing punctuation. Base diagrams on the repo's REAL structure
  (actual script/route/SQL names, real row counts) — they double as docs.
- Gate: `scripts/check-mermaid.sh <dir>` before every push that touches a README.

## Repo-hardening checklist

`scripts/audit-repo.sh` automates all of this; the table is the reference.

| Item | Rule |
|---|---|
| LICENSE | Present; holder `Nikhilvarma Kandula`; badges/README must match the actual license. **rankwell intentionally has none** (commercial) — never add unasked. |
| SECURITY.md | `templates/SECURITY-research.md` (data repos) / `templates/SECURITY-product.md` (apps). |
| CITATION.cff | All public repos; `type: dataset` when the corpus is the artifact; must parse as YAML. |
| Dependabot | Only ecosystems with a manifest present (pip→requirements.txt, npm→package.json, github-actions→workflows). |
| .gitignore | Language-correct (`templates/python.gitignore`); never empty; watch for foreign templates (Flash ignores shipped twice). |
| requirements.txt | Every Python repo; derive from actual imports; never empty. |
| README | No placeholder usernames; clone URLs = `kandulanikhilvarma/<repo>`; fences closed; badge row; `## Architecture` mermaid; `## License` section; dataset repos add Data & Attribution (name the data license, "code MIT, data under original terms"); footer `LinkedIn · Email · Portfolio`; WIP repos keep the banner. |

## CI recipes (templates/)

- Python analysis: `workflow-lint.yml` + `ruff.toml` at root (notebook idioms
  ignored for `*.ipynb`; keep `.py` strict — fix real dead code, don't widen ignores).
- Repos with tests: `workflow-tests.yml`. Watch it pass locally first.
- First workflow in a repo → add `github-actions` ecosystem to its dependabot.yml.

## Multi-repo batch pattern (proven July 2026, 9 repos)

1. `audit-repo.sh` across all repos → one findings table.
2. Plan once; ask the one genuinely-owner question up front (scope, naming).
3. Templates → `cp` loop; tailored files individually.
4. Verify everything machine-checkable locally (YAML/ruff/pytest/mermaid).
5. One conventional commit per repo per concern (`git commit -F`); push with
   2s/4s/8s/16s retry backoff; PRs only when asked; merge only on green.
6. Read back final state from GitHub (sync, check runs, contributor graph).
