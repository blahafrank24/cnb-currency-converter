# AI log

How AI was used in this repository, kept short and factual.

- **Tool:** [Claude Code](https://claude.com/claude-code). The commits carry a `Co-Authored-By: Claude` line.
- **Rules it worked under:** [CLAUDE.md](CLAUDE.md), including the lean-dependency rule and the rule that each commit is approved by Frank before it is made and pushed.
- **Workflow per step:** Claude implements one step of [docs/PLAN.md](docs/PLAN.md), runs `npm run check`, stages the files, and shows the status, a diff summary and the proposed commit message. Frank answers yes or asks questions; only then is it committed and pushed.
- **Sources for this log:** the Claude Code sessions that built the project, the hand-off summary between them, and the commit history.
- **Not in this log:** raw chat transcripts.

## Steps

| Date | Commit | What the AI did |
|---|---|---|
| 2026-10-13 | `c18323e` Initialize Vite React TypeScript project | Step 0 CORS check against `daily.txt`; hand-written scaffold (not `npm create vite`, to avoid ESLint and demo files), strict `tsconfig`, scripts |
| 2026-10-14 | `86258e1` Document deploy-time copy of `daily.txt` | Docs update after the CORS discussion below |
| 2026-10-14 | `2b4211b` Add CNB daily.txt parser with tests | Step 2 |
| 2026-10-14 | `6f0d903` Add CZK conversion with tests | Step 3 |
| 2026-10-14 | `cf84915` Fetch rates with React Query | Step 4, including the dev proxy |
| 2026-10-14 | `ad01556` Show rates table | Step 5 |
| 2026-10-14 | `436063f` Add converter form | Step 6 |
| 2026-10-14 | `254bc9b` Style the app with styled-components | Step 7: theme object, `GlobalStyle`, responsive layout, focus styles, tabular numbers |
| 2026-10-15 | `4292808` Add component tests | `src/App.test.tsx` (5 tests); `jsdom`, `@testing-library/react` and its `@testing-library/dom` peer |
| 2026-10-15 | `2c5fc7f` Show when the rates were synced | Build-time constant and the "Synced" label |
| 2026-10-15 | `06cce3b` Add GitHub Pages deploy workflow | `deploy.yml`: check, build, copy CNB's `daily.txt`, deploy |
| 2026-10-15 | `6d9ef68` Write README | README with the brief checklist and decisions |
| 2026-10-15 | `2be7658` Keep the rates date visible on phones | Moved the date out of the scrolling table caption |
| 2026-10-15 | `0321a85`, `7172a3b` | Doc fixes, and the Worker proxy recorded as the next step |

## Decisions made by Frank

- **CORS and `daily.txt`:** accepted that CNB blocks browsers and that the app needs a same-origin copy. Rejected a scheduled deploy because it adds a mechanism that needs maintenance; chose a copy made at deploy time plus a visible "Synced" time, and asked for the docs to be updated in a separate commit.
- **Dev proxy:** moved from Step 9 into Step 4, so Steps 4 to 8 work in `npm run dev`.
- **Parsing in `queryFn`:** kept it, and had the retry downside recorded as a known trade-off in `ARCHITECTURE.md`.
- **Rates table:** asked whether the brief requires 3 to 6 decimals before choosing how to show them.
- **Cloud session:** moved the work to the cloud after Step 6 to continue on a phone; the hand-off summary restated the rules in `CLAUDE.md`, the per-commit approval rule and the remaining steps.
- **Tests:** kept `fireEvent` over `user-event`, and corrected the line in `ARCHITECTURE.md`.
- **Steps 9 and 10:** split Step 9, so the "Synced" label came first and the `curl` step went into the workflow in Step 10.
- **Hosting:** Pages from the "GitHub Actions" source. Deploying "from a branch" would publish the unbuilt source.
- **Next step:** leave the data as a deploy-time copy and record a Cloudflare Worker as the next step. A scheduled refresh was offered and not taken.
- **Phone layout:** fix the clipped date as an extra commit.
- **Disclosure:** keep this log.

## What the AI got wrong or had to correct

- The plan put the workflow `curl` step in Step 9, before the workflow file existed. It was flagged and split instead of silently reordered.
- The docs had drifted from the repo (folder layout, test list, dependency table). Found in an audit at the end, then fixed.
- On a first look at the live site after a deploy, a cached page was mistaken for a failed fix. The server was already serving the new bundle.

## Checked, and not checked

- **Checked:** strict `tsc`, 50 tests, the deploy workflow (it runs `check` and `build` before every deploy, and the runs succeeded), the live site in the in-app browser at desktop and 375px width.
- **Not checked:** a real phone, other browsers, screen readers.
