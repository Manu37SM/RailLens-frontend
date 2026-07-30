# RailLens Frontend

RailLens Frontend is the Next.js (App Router) client for RailLens, a railway-information system for Indian Railways. It talks exclusively to the `train-db` Spring Boot backend over REST — no external/live railway APIs are used anywhere in the app, by design (see "Known Gaps" below).

The app covers:

- **Core browsing** — train search, train details (full route/timetable), station details, and "trains between two stations" journey search.
- **Accounts** — registration/login backed by the backend's JWT auth, an account page for profile/password/account management.
- **Personalization** (all local, stored per-browser via `localStorage`) — favorites for trains/stations/routes, recent search history, saved journeys, and popularity-ranked recent/popular searches.
- **Dark mode** — a manually-toggled light/dark theme (independent of OS preference, persisted across visits).
- **Admin Portal** (`/admin`) — a key-gated dashboard for cache management, triggering CSV re-import, and a dataset-health diagnostics panel.
- **Developer docs** (`/developers`) — REST API documentation with copyable curl/JavaScript/Python request snippets.
- **Railway Intelligence** — a suite of analytics pages and detail-page cards computed entirely from the dataset (route complexity/uniqueness scores, station network centrality, route comparison, leaderboards, trivia, achievements, and a small structured-query "smart search"). See the route table below for the full list.

## Tech Stack

Versions below are read directly from `package.json` — check there for the current values, as they change over time.

- **Next.js** 16 (App Router)
- **React** 19
- **TypeScript** 5
- **Tailwind CSS** v4 (`@tailwindcss/postcss`), using CSS custom-property design tokens and Tailwind's class-based `dark:` variant (`.dark` on `<html>`, toggled manually — not `prefers-color-scheme`)
- **lucide-react** for icons (no raster/photographic images in the app)
- **Vitest** + **React Testing Library** (`@testing-library/react`, `@testing-library/jest-dom`) for unit/component tests, run in a `jsdom` environment via `@vitejs/plugin-react`
- **ESLint** (`eslint-config-next`) and **Prettier** (with `prettier-plugin-tailwindcss` for class sorting)

State management is intentionally hand-rolled rather than a library dependency: a small `createLocalStorageStore` primitive built on `useSyncExternalStore` backs every client-persisted store (favorites, recent searches, saved journeys, preferences, popularity, admin key, auth). There is no Redux/Zustand/SWR/React Query in the project.

## Prerequisites

- Node.js 20+
- npm
- The `train-db` backend running and reachable (locally or deployed)

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env.local` and adjust as needed:

```bash
cp .env.example .env.local
```

| Variable | Purpose | Default if unset |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the `train-db` backend's REST API, including the `/api/v1` prefix. Read in `services/api.ts`, used from both Server and Client Components (hence `NEXT_PUBLIC_`, which Next.js inlines at build time). | `http://localhost:8080/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | This site's own public URL, used for `metadataBase` (canonical/Open Graph URLs), `app/robots.ts`, and `app/sitemap.ts`. | `http://localhost:3000` |

In production (e.g. Vercel), set these in the platform's project environment variable settings rather than committing a `.env` file.

## Development

Ensure the backend is running (defaults to `http://localhost:8080`), then:

```bash
npm run dev
```

The app is available at `http://localhost:3000`.

## Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `next dev` | Start the dev server |
| `npm run build` | `next build` | Production build |
| `npm run start` | `next start` | Run the production build |
| `npm run lint` | `eslint` | Lint the codebase |
| `npm run format` | `prettier --write "./**/*.{js,jsx,ts,tsx,json,css,md}"` | Format the codebase |
| `npm test` | `vitest run` | Run the test suite once |
| `npm run test:watch` | `vitest` | Run tests in watch mode |

## Testing

Tests run under Vitest with a `jsdom` environment (config: `vitest.config.ts`, setup: `vitest.setup.ts`). Run them with:

```bash
npm test
```

Current coverage (as of this writing) is unit/component-level, not end-to-end:

- Every `localStorage`-backed store (`stores/createLocalStorageStore.test.ts` plus `favoritesStore`, `recentSearchStore`, `savedJourneyStore`, `preferencesStore`, `popularityStore`, `popularSearchStore`, `adminKeyStore`) has a dedicated test file covering hydration/subscribe behavior.
- Pure logic in `lib/` (`jwt`, `partialJourney`, `formatRelativeTime`, `theme`) has test coverage.
- One component test exists for `components/developers/CodeBlock.tsx`.

Not yet covered: the Railway Intelligence cards/pages, `services/api.ts`, and the assistant dialog's intent-resolution logic.

## Project Structure

```
app/            Next.js App Router routes (pages, layouts, error/not-found/loading boundaries)
components/     Feature-grouped React components (see below)
services/       Typed wrappers around the backend REST API
stores/         Client-side state (localStorage-backed stores + auth store)
types/          TypeScript types mirroring backend DTOs
lib/            Pure utility/business-logic modules (JWT decoding, theme, formatting, etc.)
hooks/          Shared React hooks (e.g. the global "/" search-focus shortcut)
public/         Static assets, PWA manifest/icons
```

`components/` is organized by feature area, not by component "type":

```
components/
├── account       Account management page client
├── achievements  Achievements leaderboard grid
├── admin         Admin Portal dashboard, key gate, dataset health panel
├── assistant     In-app chat assistant (dialog, quick actions, header, etc.)
├── auth          Login/register forms, auth nav links
├── common        Shared primitives: StationAutocomplete, ErrorState, FavoriteButton, ShareButton, etc.
├── developers    API docs page: code blocks, endpoint cards
├── favorites     Favorites list page
├── funstats      Fun Facts grid
├── history       Search history list
├── home          Homepage sections: dashboard, quick access, recent/popular searches, Railway Insights
├── journey       Journey ("trains between stations") search form, results, result rows
├── layout        Navbar, Footer, Container, Breadcrumb, Card
├── network       Railway Network stats grid
├── pwa           Service worker registration
├── rankings      Rankings leaderboard grid
├── saved-journeys  Saved journeys list
├── smartsearch   Smart Search client (structured-query input + results)
├── station       Station header, train list/rows, station details client, Station Intelligence card
├── stats         Dataset statistics grid
├── theme         Dark-mode toggle
└── train         Train search/list/cards, journey timetable rows, Train Intelligence card, Route Comparison card
```

## Routes

| Route | Description |
|---|---|
| `/` | Home — search entry points, recent/popular searches, favorites, Railway Insights section |
| `/trains` | Train search |
| `/trains/[trainNumber]` | Train details — full route/timetable, plus Train Intelligence and Route Comparison cards |
| `/stations` | Station search |
| `/stations/[stationCode]` | Station details — trains stopping there, plus the Station Intelligence card |
| `/journeys` | Trains running between two stations (supports `?from=`/`?to=` deep links) |
| `/login` | Sign in |
| `/register` | Create an account |
| `/account` | Manage profile, password, and account (requires auth) |
| `/favorites` | Favorited trains/stations/routes |
| `/history` | Recent search history |
| `/saved-journeys` | Saved from/to journey searches |
| `/network` | Railway Network — station graph stats: density, connected components, diameter, most central stations |
| `/rankings` | Leaderboards — most/fewest halts, halt duration, popular origins, most-connected stations |
| `/fun-facts` | Station name trivia, alphabet coverage, palindrome station codes |
| `/achievements` | Top-100 longest/fastest trains, mega routes, super express rankings, rare routes, hidden gems |
| `/smart-search` | Structured natural-language-ish query search (e.g. "trains that stop at both NDLS and HWH") |
| `/stats` | Dataset statistics |
| `/developers` | API documentation with copyable curl/JS/Python snippets |
| `/admin` | Admin Portal (key-gated) — cache management, CSV import trigger, dataset health panel |
| `/assistant` | Standalone full-page entry point to the in-app chat assistant (also available globally via the floating action button) |

## Services

Typed wrappers around the backend REST API, all built on a shared `apiFetch` helper (`services/api.ts`) that reads `NEXT_PUBLIC_API_BASE_URL`, throws a typed `ApiError` (carrying HTTP status and the backend's structured error message) on any failure, and supports authenticated requests via `Authorization: Bearer` or the admin `X-Admin-Key` header:

- `trainService.ts` — search, train details, train intelligence, route comparison
- `stationService.ts` — search, station details, station intelligence
- `journeyService.ts` — trains between two stations
- `authService.ts` — register, login, current user, password/account management
- `statsService.ts` — dataset stats, rankings, fun stats, achievements
- `networkService.ts` — railway network graph stats
- `smartSearchService.ts` — structured query search
- `adminService.ts` — cache management, CSV import trigger, dataset health (admin-key gated)

## Key Stores

All client-persisted stores are built on `stores/createLocalStorageStore.ts`, a small primitive using `useSyncExternalStore` with an SSR-safe server snapshot, hydration-after-mount handling, and cross-tab sync via the `storage` event:

- `favoritesStore.ts`, `recentSearchStore.ts`, `savedJourneyStore.ts`, `preferencesStore.ts`, `popularityStore.ts`, `popularSearchStore.ts`, `adminKeyStore.ts`
- `authStore.ts` — JWT session state (separate from the localStorage-store primitive above, given the sensitivity of holding a token)

## Notable Components & Hooks

- `components/common/StationAutocomplete.tsx` — debounced (300ms), `AbortController`-cancelled type-ahead search with full ARIA combobox semantics (`role="combobox"`, `aria-expanded`, `aria-controls`/`role="listbox"`, `role="option"`, `aria-activedescendant`).
- `components/train/TrainIntelligenceCard.tsx` / `components/station/StationIntelligenceCard.tsx` — lazily fetch on mount (rather than being server-rendered with the page) so a slow/failed intelligence computation degrades gracefully instead of blocking the core page.
- `components/assistant/AssistantFab.tsx` — the floating chat assistant entry point, dynamically imported (`next/dynamic`) so its code isn't in the initial bundle for users who never open it.
- `hooks/useGlobalSearchShortcut.ts` — focuses the page's designated search input on pressing `/`.
- `app/layout.tsx` — includes a "skip to main content" link before the navbar, and a pre-hydration inline script that applies the stored/system theme before first paint to avoid a light-mode flash.

## Known Gaps

These are deliberate scope decisions, not roadmap items:

- **No live train running status, PNR status, seat availability, coach position, or platform/delay info.** These require a live/external data source (e.g. IRCTC, GPS tracking) that RailLens has decided not to depend on, consistent with keeping the project self-hosted and free of paid third-party services. The "Railway Intelligence" pages/cards are the deliberate alternative: real, working analytics computed entirely from the local dataset.
- **No map/geographic visualization** of routes or stations — not currently planned.
- **No shared OpenAPI-generated types between backend and frontend** — `types/` is hand-maintained to mirror the backend's DTOs. This is a known maintainability risk as the type surface grows; see the architecture review for details.

For a more detailed, continuously-updated audit of frontend architecture (routing, accessibility, API layer, state management, performance, and open issues), see `RailLens_Frontend_Architecture_Review.md` at the repository root.

## License

This project is intended for learning and personal development.
