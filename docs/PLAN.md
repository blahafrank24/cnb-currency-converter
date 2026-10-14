# Plan

Goal: a small, readable, well-tested currency converter that meets the brief exactly,
deployed online, with a clean linear history on `main`. Target effort: about 3 hours.

## Scope
**In:** load CNB rates on start, list them, convert CZK to a chosen currency in real time, loading/error states,
tests, GitHub repo, deploy, short README.
**Out (on purpose):** routing, global state, i18n, dark-mode toggle, historical rates, charts, PWA, e2e tests,
linting/formatting tooling beyond TypeScript strict. Each is a possible later improvement, not a todo.

## Decisions to confirm with Frank before step 1
| # | Question | Recommendation |
|---|----------|----------------|
| 1 | ESLint/Prettier? | Skip. `tsc --strict` + tests is enough for this size; mention you would add ESLint in a team repo. |
| 2 | Package manager | npm (no extra tooling to explain). |
| 3 | Repo name / visibility | `cnb-currency-converter`, public, so anyone can open it. |
| 4 | Deploy target | GitHub Pages via one GitHub Actions workflow: same place as the code, nothing to drag to another service. Frank sets Settings → Pages → Source to "GitHub Actions" once. |
| 5 | Convert on submit or live? | Live. No submit state, fewer branches to test; the brief allows it. |

## Before step 1 (Frank, 5 min)
Create the public GitHub repo, then locally `git init -b main`, `git remote add origin <url>`, copy in `CLAUDE.md` and `docs/`. Claude starts from that folder and never touches remotes or credentials.

## Step 0 — risk spike (15 min, before anything else)
The CNB endpoint may not send CORS headers, which would make a browser `fetch` fail once deployed.
In a browser console on any other origin run `fetch(url)` and read the result.
- If it works: call CNB directly, no extra moving parts.
- If it is blocked: GitHub Pages is static, so it cannot rewrite or proxy requests. The lean fallback is to let the
  deploy workflow download `daily.txt` into the build (same origin, no server code). Step 9 below.
  We decide together after the spike; I would not use a public third-party CORS proxy.
Write the outcome in the ARCHITECTURE decisions table.
**Outcome (2026-10-13): blocked.** We go with the deploy-time copy and no scheduled run (see Step 9 and ARCHITECTURE).

## Steps (one commit each, all on `main`, each approved by Frank before it is committed and pushed)
1. `Initialize Vite React TypeScript project` — scaffold, strict tsconfig, remove template demo files, `.gitignore` (includes `private/`), scripts, add `CLAUDE.md` and `docs/`.
2. `Add CNB daily.txt parser with tests` — `src/domain/parseRates.ts`: text to `{ date, rates[] }`; tests for the real sample, blank lines, bad rows, `Amount` of 100.
3. `Add CZK conversion with tests` — `src/domain/convert.ts`: CZK to foreign = `czk * rate.amount / rate.rate`; tests incl. JPY (amount 100), zero, rounding.
4. `Fetch rates with React Query` — `src/api/fetchRates.ts`, `src/hooks/useRates.ts`, `QueryClientProvider` in `main.tsx`; `staleTime` 1 hour, `retry` 1. `fetchRates` requests the same-origin `daily.txt`; `vite.config.ts` gets a dev-server proxy for `/daily.txt` to CNB (about 6 lines) so Steps 4 to 8 work in `npm run dev`. The proxy is dev-only; production gets the file in Step 9.
5. `Show rates table` — `RatesTable` with date header, loading and error (with retry) states.
6. `Add converter form` — `ConverterForm`: CZK input (accepts `1 500,50`), currency select, live result in `aria-live`.
7. `Style the app with styled-components` — theme object, `GlobalStyle`, responsive single column, focus styles, tabular numbers.
8. `Add component tests` — App-level tests with a stubbed `fetch`: renders list, converts, shows error.
9. `Serve CNB rates from the deploy` (CORS is blocked, so this step is required) — workflow step fetches `daily.txt` into `dist/` on every deploy (`curl -f`, so a CNB outage fails the job and the previous deploy stays live); the dev proxy already exists from Step 4. The build time is injected as a constant and the UI shows "Synced <time>" next to the CNB date. No scheduled run: rates are as fresh as the last deploy, documented in the README. A `schedule:` line can be added later without touching app code.
10. `Add GitHub Pages deploy workflow` — `.github/workflows/deploy.yml` (checkout, setup-node, `npm ci`, `npm run check`, build, upload-pages-artifact, deploy-pages) and `base: './'` in `vite.config.ts`. Triggers: push to `main` and manual `workflow_dispatch` (a "Run workflow" button to refresh the rates). Frank enables Pages (Source: GitHub Actions).
11. `Write README` — what, how to run, live link (`https://<user>.github.io/cnb-currency-converter/`), decisions summary, "what I would do next".

## Definition of done
- [ ] Every point of the brief is visibly met (checklist in README).
- [ ] `npm run check` and `npm run build` pass from a clean clone.
- [ ] Live URL works on desktop and phone width, and shows the data date.
- [ ] `main` history is linear, reads like this plan, and every commit was approved by Frank.
- [ ] Frank understands every file and dependency: Claude explained each step in detail and `private/UNDERSTANDING.md` is up to date.
