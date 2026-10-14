# Architecture

Principle: **the smallest thing that satisfies the brief, with every piece defensible.**
Four runtime dependencies, all required by the brief or by React itself.

## The data (CNB `daily.txt`)
```
12 Oct 2026 #196
Country|Currency|Amount|Code|Rate
Australia|dollar|1|AUD|15.212
```
- Line 1: date and serial number. Line 2: header. Then pipe-separated rows, `.` as decimal separator.
- **Quirk that matters:** `Amount` is not always 1 (for example JPY and HUF are quoted per 100). The rate is CZK per `Amount` units.
  So `foreign = czk * amount / rate`. Ignoring `Amount` is the classic bug; there is a test for it.
- CZK itself is not in the file; the user always converts from CZK.
- Published on working days (afternoon). On weekends the file still shows the last fixing date, so the UI shows that date.

## Folder layout
```
.
├── CLAUDE.md                 rules for Claude Code in this repo
├── README.md                 how to run, live link, decisions summary
├── docs/
│   ├── PLAN.md               scope, steps, definition of done
│   └── ARCHITECTURE.md       this file
├── index.html                Vite entry
├── package.json              4 runtime deps, scripts
├── tsconfig.json             strict
├── vite.config.ts            React plugin, relative base, Vitest config
├── .github/workflows/
│   └── deploy.yml            test, build and publish to GitHub Pages on push to main
└── src/
    ├── main.tsx              mounts App inside QueryClientProvider
    ├── App.tsx               layout and composition only
    ├── api/
    │   └── fetchRates.ts     fetch text from the endpoint, throw on non-2xx
    ├── domain/               pure functions, no React, no I/O
    │   ├── types.ts          Rate, RatesSnapshot
    │   ├── parseRates.ts     text to RatesSnapshot
    │   ├── convert.ts        CZK to foreign amount
    │   ├── parseAmount.ts    typed text ("1 500,50") to number or null
    │   └── *.test.ts         unit tests
    ├── hooks/
    │   └── useRates.ts       useQuery wrapper that fetches and parses
    ├── components/
    │   ├── RatesTable.tsx    list of rates + date + loading/error states
    │   ├── ConverterForm.tsx amount input, currency select, live result
    │   └── *.test.tsx        component tests (stubbed fetch)
    └── styles/
        ├── theme.ts          colors, spacing, radii as one object
        └── GlobalStyle.ts    createGlobalStyle: box-sizing, font, body
```

## Data flow
```
CNB daily.txt --fetchRates (string)--> useRates (React Query cache)
   --parseRates (RatesSnapshot)--> App --> RatesTable (render)
                                       \-> ConverterForm --convert--> result
```
- `fetchRates` only does transport. `parseRates` only does text. `convert` only does math. Components only render.
  Each layer can be tested alone, and the parser/math tests need no DOM.
- Parsing happens in the query function (`select`-style), so components always receive typed data, never raw text.
- Form state is local `useState` (amount string, selected code). The result is **derived** during render, not stored.
  No effects, no sync bugs.

## Dependencies and why
| Package | Why it is here | Why not something else |
|---|---|---|
| `react`, `react-dom` | Required by the brief | n/a |
| `styled-components` | Required by the brief | Used for the theme + a handful of styled primitives, no extra styling library |
| `@tanstack/react-query` | Required by the brief | Gives caching, loading/error states, retry and refetch for free; a hand-written `useEffect` fetch would be more code and more bugs |
| `vite` + `@vitejs/plugin-react` (dev) | Fast dev server and build with the least config; Next.js is forbidden | CRA is deprecated; webpack is heavier to explain |
| `typescript` (dev) | Required by the brief | strict mode doubles as our "linter" |
| `vitest`, `jsdom`, `@testing-library/react` (dev) | Tests run in the same Vite config, no Babel/Jest setup; RTL tests behaviour (what the user sees) | Jest needs extra transform config; Cypress/Playwright is overkill here |

Deliberately **not** used: UI kit, form library, `react-hook-form`, Redux/Zustand, router, date library
(the date is shown as the text CNB gives, parsed once), `axios` (`fetch` is enough), `msw` (stubbing `fetch` is enough),
ESLint/Prettier (see plan; trade-off, not an oversight), `user-event` (RTL `fireEvent` covers our two interactions).

## Key decisions
| Decision | Reasoning | Trade-off / what I would change at scale |
|---|---|---|
| Live conversion, no submit button | Brief allows "in real-time"; no submit state, simpler tests, better UX | A submit flow suits slow or paid conversions |
| Result derived in render | One source of truth; nothing to keep in sync | If conversion were expensive, `useMemo` |
| Accept `1500,50` and `1 500.50` input | Czech users type decimal commas; one small normalise function | Use `Intl`-based parsing for many locales |
| Plain `number` for money | Display-only conversion, rounded to 2 decimals via `Intl.NumberFormat` | For real money use integer minor units or a decimal library |
| Parse inside the `queryFn`, not in `select` | The cache holds the typed `RatesSnapshot`, so every consumer gets typed data from one place | **Known downside:** a malformed file throws inside the query, so React Query retries it once like a network error. The retry cannot succeed (same file, same result), so the error state appears a second or two later than necessary. Accepted for simplicity; a custom error class plus a `retry` function would skip it |
| `staleTime` 1 hour, `retry` 1 | CNB publishes once per working day; no need to refetch on every focus | Compute the next publication time and refetch then |
| Deploy to GitHub Pages with Actions | Code and hosting in one place, free, tests run before every deploy | Pages is static only: no rewrites, no server logic |
| Relative `base: './'` | Works under `/<repo>/` without hard-coding the repo name | n/a |
| Same-origin copy of `daily.txt` fetched at deploy time (CORS blocks CNB) | Pages cannot proxy, so the deploy workflow fetches the file into `dist/`; no server code, no scheduled job to maintain | Rates are as old as the last deploy (refresh by pushing or the manual "Run workflow" button); the UI shows the CNB date and the sync time so staleness is visible. A `schedule:` trigger would give daily freshness; an edge function would give live data |
| Show "Synced <time>" from a build-time constant | Honest about how old our copy is, with no extra file or request | One more value to display and test |
| Pure `domain/` folder | Parsing and math are the real logic; test them without React | n/a |
| Styled components with a single theme object, imported directly (no `ThemeProvider`) | Brief requires them; one plain object keeps colors/spacing in one place, and skipping the provider avoids a `DefaultTheme` type declaration file | `ThemeProvider` is needed for runtime theme switching, for example dark mode |
| Everything on `main`, small commits | Brief asks for commits throughout; linear history is easy to read | Team repos use PRs and CI |

CORS outcome of the Step 0 spike (2026-10-13): **blocked.** `daily.txt` sends a fixed `Access-Control-Allow-Origin: apl.cnb.cz`
(not `*`, no scheme, never echoes the caller's `Origin`, no `Vary`), and the `OPTIONS` preflight returns an HTML page without CORS headers.
Browsers reject it from any other origin. Fix: Step 9, the deploy workflow downloads `daily.txt` into `dist/` on every deploy
so the app fetches it same-origin; dev uses a Vite proxy (added in Step 4). No third-party CORS proxy and no scheduled run (less to maintain).
Known limit: the brief says "latest rates", but our copy is only as fresh as the last deploy; the UI shows the CNB date and the sync time.

## Error and edge cases handled
- Network failure or non-2xx: error message + "Try again" button (`refetch`).
- Malformed or empty file: parser throws a descriptive error; shown as the same error state.
- Rows with missing or non-numeric fields are rejected, not silently turned into `NaN`.
- Empty, zero or invalid amount: result area shows a hint, never `NaN`.
- Very large amounts: formatted with `Intl.NumberFormat`, no overflow in the layout.

## Tests (what and why)
- `parseRates.test.ts`: real sample, header handling, `Amount` of 100, blank lines, bad rows. *The most valuable tests: this is where bugs hide.*
- `convert.test.ts`: normal rate, JPY-style `Amount` 100, zero, no rounding.
- `parseAmount.test.ts`: decimal comma and dot, space and non-breaking-space thousands separators, ambiguous or invalid input rejected.
- `App.test.tsx`: stubbed `fetch`; renders the list and date, typing an amount shows the right converted value,
  failed fetch shows the error and retry works.
- Not tested on purpose: styling, the QueryClient itself, the browser.
