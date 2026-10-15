# CNB currency converter

Shows the Czech National Bank exchange rates and converts CZK to any listed currency as you type.

**Live:** https://blahafrank24.github.io/cnb-currency-converter/

Stack: React (hooks), TypeScript (strict), Styled Components, React Query, built with Vite. No Next.js.

## Run it

Needs a current Node (CI uses 24).

```bash
npm ci
npm run dev      # dev server on http://localhost:5173
npm run check    # type check + tests
npm run build    # production build into dist/
```

`npm run dev` works without extra setup: Vite proxies `/daily.txt` to CNB (see below).

## The brief

| Point | Where |
|---|---|
| React, no Next.js, Hooks, TypeScript, Styled Components, React Query | `package.json`, `src/` |
| Fetch the latest rates from CNB `daily.txt` on start | `src/api/fetchRates.ts`, `src/hooks/useRates.ts` |
| Parse the data and show a clear list | `src/domain/parseRates.ts`, `src/components/RatesTable.tsx` |
| Form: CZK amount + currency select, converted amount | `src/components/ConverterForm.tsx`, `src/domain/convert.ts` |
| Automated tests | `src/domain/*.test.ts` (parser, conversion, amount input), `src/App.test.tsx` (whole app, stubbed `fetch`) |
| Commits throughout, GitHub repo, deployed online | `git log`, GitHub Pages via `.github/workflows/deploy.yml` |
| Simple code, nice and easy UI | pure logic in `src/domain/`, components only render; real labels, `aria-live` result, responsive single column |

## Decisions worth knowing

- **CNB's `Amount` column.** JPY, HUF and others are quoted per 100 (IDR per 1000), so the conversion is `czk * amount / rate`. Ignoring `Amount` is the classic bug; it has its own tests.
- **CNB blocks browsers (CORS).** The file is served with a fixed `Access-Control-Allow-Origin: apl.cnb.cz`, so a browser on any other origin cannot fetch it. The deploy workflow therefore downloads `daily.txt` into the site (same origin), and `npm run dev` uses a Vite proxy instead. No third-party CORS proxy and no server code.
- **Known limit: the rates are as fresh as the last deploy.** There is no scheduled run, so the copy updates when `main` is pushed or when the workflow is started with "Run workflow". The page shows the CNB date and a "Synced" time so a stale copy is visible. A `schedule:` line in the workflow would give daily freshness.
- **Live conversion, no submit button.** The result is derived while rendering, so there is no state to keep in sync. Input like `1 500,50` and `1500.50` is accepted; ambiguous input like `1.500,50` is rejected with a hint.
- **Lean dependencies.** Four runtime packages (React, React DOM, Styled Components, React Query), all required by the brief. Reasons for every package and for what is deliberately left out: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- **Plain `number` for money.** Fine for a display-only conversion rounded by `Intl.NumberFormat`; real money would need integer minor units or a decimal library.

The scope and the order the project was built in are in [docs/PLAN.md](docs/PLAN.md).

## What I would do next

- Get truly live rates: a small Cloudflare Worker (about 10 lines) that fetches CNB's `daily.txt` and adds `Access-Control-Allow-Origin: *`, with the app calling it directly. CNB's other endpoints, including its JSON API, also send no usable CORS header, so some middleman is needed. This would remove the deploy-time copy, the dev proxy and the "Synced" label, at the cost of one extra service and backend code.
- Short of that, refresh the copy automatically with a `schedule:` trigger on the deploy workflow (for example every 30 minutes on weekday afternoons).
- ESLint in a team repo (strict TypeScript and tests were enough at this size).
- Skip React Query's retry when the file is malformed, because the retry cannot succeed.
- `user-event` for tests if the form gets key handling or debouncing.
- Convert between any two currencies, not only from CZK.
