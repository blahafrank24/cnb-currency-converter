# CLAUDE.md — CNB currency converter

Small React app that shows Czech National Bank exchange rates and converts CZK to other currencies.
The author (Frank) owns every decision in this code, so **every file and every dependency must have a clear one-sentence reason to exist.**
Read `docs/PLAN.md` (what and in which order) and `docs/ARCHITECTURE.md` (where and why) before changing anything.

## The brief (non-negotiable)

1. React app, **no Next.js**. Stack: React (Hooks), TypeScript, Styled Components, React Query.
2. On start, fetch the latest rates from the Czech National Bank `daily.txt`.
3. Parse the data and show a clear list of rates.
4. Simple form: amount in CZK + currency select, shows the converted amount (real-time is fine).
5. Automated tests that make sense for the solution.
6. Code is committed throughout and lives in a GitHub repo; the app is deployed online.
7. Keep the code simple and the UI nice and easy to use.



## Rules of the project

- **Lean first.** Runtime deps are only: `react`, `react-dom`, `styled-components`, `@tanstack/react-query`.
Do not add a library (UI kit, form lib, state manager, router, date lib, icon set, CSS reset) without asking Frank
and writing the reason in `docs/ARCHITECTURE.md`. If the platform or ~20 lines of code does it, do that.
- **Dev deps are limited to:** `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `jsdom`,
`@testing-library/react`, `@types/*`. Anything else needs the same discussion.
- **Strict TypeScript** (`strict: true`, no `any`, no non-null `!` shortcuts). `npm run check` must stay green.
- **Pure logic is separate from React.** Parsing and conversion are plain functions in `src/domain/`, with unit tests.
Components only render and wire things together.
- **No comments that restate code.** Comment only the "why" (for example the CNB `Amount` column quirk).
- **English UI and English code.** Accessible by default: real `<label>`s, `aria-live` for the result, keyboard friendly.
- **No secrets, no env vars, no backend code.** Hosting is GitHub Pages (static); the only automation is the deploy workflow in `.github/workflows/`.



## Git workflow

- **Everything goes straight to** `main`**. No branches, no PRs, no merge commits, no force pushes, no history rewrites.**
- Small commits that each build and pass tests. Imperative present tense, first line under 72 chars,
for example `Add CNB daily.txt parser with tests`. A short body only when the "why" is not obvious.
- Commit after each step in `docs/PLAN.md`; the history should read like the plan.
- **Frank approves every commit before it is made and pushed.** For each step: stage the files, show Frank the `git status`,
a short summary of the diff and the proposed commit message, then **wait for an explicit yes**. Only then run `git commit` and `git push origin main`.
One approval covers exactly one commit; never batch several commits under one approval, and never push without it.
- Never commit `node_modules`, `dist`, or editor files.



## Commands (npm only, commit `package-lock.json`)

- `npm run dev` — Vite dev server
- `npm test` — Vitest, run once
- `npm run check` — `tsc --noEmit` + tests; run before every commit
- `npm run build` — production build into `dist/` (what Pages publishes)



## Working with Frank

- **Explain in detail.** For every step say what changed, why it is done this way, which alternatives exist and what each file or
dependency is for, so Frank fully understands the repository and can decide with full information. Answer follow-up questions in depth.
- Keep `private/UNDERSTANDING.md` current (quick "why is this here?" answers). `private/` is gitignored: never stage or commit it.
- Prefer the simplest solution that meets the brief, then stop. Do not add features "for polish" beyond `docs/PLAN.md`.
- When there are two reasonable options, name both with the trade-off and recommend one.

