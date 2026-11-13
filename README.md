# RailLens Frontend

> **Going live?** Follow [`DEPLOYMENT.md`](DEPLOYMENT.md): one step-by-step guide for the backend, website, Android app and RailOps, with a tracker of what's merged vs. live.

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
| `RAILLENS_PROXY_SECRET` | **Server-only secret** (never `NEXT_PUBLIC_`). The sign-in routes send it to the backend with the visitor's IP so login rate limits stay per visitor. Must equal the backend's `RAILLENS_CLIENT_IP_PROXY_SECRET`. 32+ characters. | unset: IP not forwarded, all sign-ins share one rate-limit bucket |
| `NEXT_PUBLIC_RAILLENS_LOGIN_PROVIDER` | Who handles sign-in (single login, Phase 4D): `raillens` or `railops`. Read at build time, so changing it needs a redeploy. Any other value means `raillens`. | `raillens` |
| `RAILOPS_API_URL` | **Server-only.** RailOps gateway address; used only when the provider is `railops`. | unset: sign-in answers 503 in `railops` mode |
| `RAILOPS_PROXY_SECRET` | **Server-only secret.** Equals the RailOps gateway's `RAILOPS_EDGE_PROXY_SECRET` (32+ characters), so RailOps' login rate limits stay per visitor. | unset: all sign-ins share one RailOps rate-limit bucket |
| `NEXT_PUBLIC_RAILOPS_API_URL` | RailOps gateway address the **browser** calls for booking (Phase 5). Booking shows only when this is set **and** the login provider is `railops`. | unset: no booking |
| `NEXT_PUBLIC_RAILOPS_PAYMENTS` | How RailOps takes payment (Phase 6): `simulated` (a demo button) or `razorpay` (Razorpay test mode: the booking page opens Razorpay's hosted page, then waits for the confirmation when the passenger comes back). | `simulated` |
| `NEXT_PUBLIC_RAILOPS_PAYMENT_HOSTS` | https hosts the payment page may be on. The website refuses to redirect anywhere else. | empty: `rzp.io` in Razorpay mode, nothing otherwise |

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

- Every `localStorage`-backed store (`stores/createLocalStorageStore.test.ts` plus `favoritesStore`, `recentSearchStore`, `savedJourneyStore`, `preferencesStore`, `popularityStore`, `popularSearchStore`) has a dedicated test file covering hydration/subscribe behavior.
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
- `authStore.ts` — who is signed in (username, email, role). It holds **no tokens in storage**: the refresh token is an HttpOnly cookie and the access token is kept only in memory (see "Sign-in and tokens").

## Sign-in and tokens

Since Phase 2B, calls that start or end a session (`login`, `register`, `refresh`, `logout`, `mfa/confirm`) go to this site's own server routes in `app/api/auth/*` (`lib/server/authProxy.ts`), not straight to the backend:

- The backend's refresh token is put in an **HttpOnly, SameSite=Strict cookie** (`__Secure-raillens_rt`, path `/api/auth`). Page scripts can't read it, so an injected script can't steal a 30-day session, and other sites can't make the browser send it. The response body carries `refreshToken: null`.
- The short-lived **access token stays in memory** only. After a page load, `lib/sessionRefresh.ts` gets a new one through the cookie. If two tabs refresh at the same moment, the loser retries once after a second.
- Sessions from before 2B (with tokens in `localStorage`) are moved into the cookie on the first refresh, so nobody is logged out by the upgrade.
- These routes only accept requests whose `Origin` is this site. They pass the visitor's IP to the backend with `RAILLENS_PROXY_SECRET`.
- All other API calls (search, account, admin) still go directly to the backend with `Authorization: Bearer`.

### Security headers (Phase 6)

`next.config.ts` sends a **Content-Security-Policy** on every page (`lib/csp.ts`): scripts, styles, fonts and workers only from this site; the browser may only talk to this site, the RailLens API and the RailOps gateway (taken from the two `NEXT_PUBLIC_*_URL` settings at build time); no plugins, no `<base>` hijacking, forms only post here, no framing. It still allows inline scripts, because Next.js puts page data in inline scripts and most pages are static; a nonce-based policy would need every page rendered per request. Checked in headless Chrome: no violations on the home, login, register and booking pages.

### Booking (Phase 5)

When booking is on (see the two settings above), RailLens sells RailOps tickets:

- **Train page → Book this train:** pick a date and stations; the card finds the RailOps run (`GET /api/v1/runs?trainNo&date`), maps RailLens station codes to RailOps stop numbers and shows seats per class (general quota).
- **`/book`:** up to 6 passengers and a contact number, then "Hold seats for 10 minutes". One idempotency key per attempt, so a retry never books twice.
- **`/bookings/[pnr]`:** fare, passengers and status; **Pay (simulated)** calls RailOps' demo-only `simulated-payment` and waits for the booking to turn *Booked*. Cancel shows the refund first. Where RailOps uses a real gateway, it falls back to the gateway's checkout, but only on an allow-listed https host.
- **`/bookings`:** my bookings.
- **Phase 6:** the booking form shows a **live seat map** for the class and journey (`GET /api/v1/runs/{id}/seat-map`, refreshed every 15 s, never names anyone) and a berth or seat **preference** per passenger (side lowers aren't offered: RailOps keeps them for RAC). With `NEXT_PUBLIC_RAILOPS_PAYMENTS=razorpay` the Pay button opens Razorpay's test-mode page.

The browser calls the RailOps gateway directly with the signed-in person's RailOps access token (the same in-memory token as everything else). The RailOps gateway must allow this site (`RAILLENS_WEB_ORIGIN` in RailOps' `render.env`). Prices always come from RailOps; the website never sends an amount. Code: `services/bookingService.ts`, `components/booking/`.

### Single login (Phase 4D)

With `NEXT_PUBLIC_RAILLENS_LOGIN_PROVIDER=railops` the same routes sign people in through RailOps instead (`lib/server/railopsAuth.ts`):

- Login and register call RailOps' app endpoints (`/api/v1/auth/app/*`, `/api/v1/auth/register`); the RailLens backend's `/auth/me` then links or creates the RailLens profile for that RailOps token and says whether the person is an admin. The browser gets the same answer shape as before.
- Sign-in is by **email**. New accounts give a **phone number** instead of a username (RailLens makes the username from the email). Passwords need **10+ characters** (RailOps' rule).
- Staff admins tick "Staff? Add your one-time code" and send the code with the password; MFA setup happens in the RailOps staff app.
- The RailOps refresh token gets its **own cookie** (`__Secure-raillens_ro_rt`), so tokens never go to the wrong service when the setting is flipped. Everyone signs in once more after a switch (and after a rollback).
- Change password and delete account are unchanged here: the RailLens backend forwards them to RailOps for linked profiles.

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
