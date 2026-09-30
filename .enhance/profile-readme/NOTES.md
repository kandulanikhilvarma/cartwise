# Profile README proposal

Target: `kandulanikhilvarma/kandulanikhilvarma`. Not pushed. Apply it yourself (steps below).

## What changes

| Change | Why |
|---|---|
| Header SVG, light and dark, through `<picture>` | GitHub runs no JavaScript. An SVG with CSS keyframes animates in the README. The rule draws once and the dot pulses; both stop under `prefers-reduced-motion`. |
| "Where it came from", "Numbers" and "What I work with" folded into `<details>` | The top of the page now scans in one screen: identity, six products, lessons, contact. Nothing is deleted. |
| Activity section with a contribution animation | Built daily by a GitHub Actions workflow into an `output` branch, so the README loads a committed file, not a live image service that rate-limits. |

All prose, numbers and links are the same as today (`current-README.md` is the copy compared against).

## Apply

1. Copy `README.md`, `assets/` and `.github/workflows/snake.yml` into the root of the profile repository.
2. Commit and push to `main`.
3. In the repository, open Actions, select "Contribution animation", and run it once. It creates the `output` branch with `snake-light.svg` and `snake-dark.svg`.
4. Open github.com/kandulanikhilvarma and check both themes.

The workflow uses two third-party actions: `Platane/snk@v3` (draws the animation) and `crazy-max/ghaction-github-pages@v4` (commits it to `output`). Drop the Activity section and the workflow if you do not want them.
