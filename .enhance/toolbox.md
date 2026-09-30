# Toolbox

Tools that this session has, and where the run uses them. A tool is listed only if it fits a real need.

| Need | Covered by | Use in phase |
|---|---|---|
| Keep changes small, no new abstractions | `ponytail` skill (active), repo `AGENTS.md` | 3, 4 |
| Parallel read-only audit | subagents `ecc:a11y-architect`, `ecc:typescript-reviewer` | 1 |
| Security, performance, CI audit | done in the main session (small codebase, 80 source files) | 1 |
| Dependency CVEs | `npm audit` | 0, 1, 6 |
| Tests and coverage | Vitest + `@vitest/coverage-v8` (already installed) | 4, 6 |
| Screenshots and interaction checks | built-in browser pane (`mcp__Claude_Browser__*`) with `.claude/launch.json` dev server | 2, 4, 6 |
| Lighthouse-style scores | `mcp__plugin_ecc_chrome-devtools__lighthouse_audit` (if it connects), else not measured | 6 |
| Design references | Mobbin MCP (`search_screens`), web search | 2 |
| Mermaid validation for README | `validate_and_render_mermaid_diagram` MCP | 5 |
| GitHub branch, PR, CI state | `gh` CLI, logged in as `kandulanikhilvarma` | 5, 6 |
| Plain-English prose | `ste100` skill style rules, applied by hand | all reports |

## Not used, and why

- Figma, Canva, Adobe, Magic Patterns: no design files exist for this project. The design source is `DESIGN.md` and `src/app/globals.css`.
- Supabase, Neon, Vercel MCPs: read-only config checks are not needed for this run, and a write is out of scope (`DEPLOY: no`).
- Sentry: not configured in the repo.

## Gaps

| Gap | Why it matters | Best option |
|---|---|---|
| Signed-in browser session | Every app page (`/home`, `/scan`, `/grocery`, `/settings`) sits behind Google OAuth. This session cannot sign in, so those pages get unit tests but no screenshots. | User captures the screens, or a test-only auth provider behind an env flag (a product decision, not done here). |
| End-to-end test runner | No Playwright in the repo. The critical scan path has no browser test. | `@playwright/test` with one smoke test of the public pages and `/demo`. |
| Lighthouse in CI | No performance budget. | `treosh/lighthouse-ci-action` on the public pages. |
