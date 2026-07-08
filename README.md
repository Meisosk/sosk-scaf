# sosk-scaf

A personal, opinionated Vite + React (TypeScript) scaffold with MUI theming, Supabase-backed auth, an admin panel with charted analytics, and event tracking — all baked in as a single fixed template (no variants).

Generated via [`create-sosk-scaf`](https://github.com/Meisosk/create-sosk-scaf):

```bash
npx create-sosk-scaf
```

## Stack

- **Vite + React + TypeScript**
- **MUI** with a `cssVariables: true` theme (light/dark color schemes) — `palette.ts` is the only file a customizer needs to touch
- **React Router** for client-side routing
- **Recharts** for analytics charts (themed to follow `palette.ts` automatically)
- **Supabase** for auth and analytics storage
- **Express** for a protected backend API (uses the Supabase service-role key, which never touches the browser)

## Getting started

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your Supabase project values (see [Setting up Supabase](#setting-up-supabase) below):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PORT=3001
```

Run the frontend:

```bash
npm run dev
```

Run the backend API (in a separate terminal):

```bash
npm run server
```

## Project structure

```
src/
├── lib/
│   ├── supabase.ts          → Supabase client (browser, anon key)
│   ├── session.ts           → per-tab session ID (sessionStorage-based)
│   └── analytics.ts         → aggregation helpers (e.g. groupViewsByDay)
├── contexts/
│   └── AuthContext.tsx      → session state, signIn/signOut
├── components/
│   └── ProtectedRoute.tsx   → redirects to /signin if not authenticated
├── hooks/
│   ├── useTrackPageView.ts  → logs a page view to Supabase on mount
│   └── useTrackEvent.ts     → logs a named interaction event on demand
├── pages/
│   ├── SignIn.tsx           → /signin
│   ├── Admin.tsx            → /admin (protected, charts + tables)
│   └── WelcomePage.tsx      → / (landing page, tracked)
├── vite-env.d.ts            → Vite client types + typed import.meta.env
└── App.tsx                  → routes + provider tree

server/
└── index.js                 → Express API, requireAuth middleware, uses service-role key
```

## Routing

| Path      | Access    | Notes                                         |
| --------- | --------- | --------------------------------------------- |
| `/`       | Public    | `WelcomePage`, tracked via `useTrackPageView` |
| `/signin` | Public    | Email/password sign-in via Supabase Auth      |
| `/admin`  | Protected | Redirects to `/signin` if no active session   |

`ProtectedRoute` wraps any route that requires authentication — wrap additional routes the same way as the admin area grows.

## Setting up Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard) (no GitHub connection needed — that's only for Supabase's Branching feature, not required here).
2. Go to **Project Settings → API Keys**:
   - **Project URL** → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **Publishable key** (or legacy anon key) → `VITE_SUPABASE_ANON_KEY`
   - **Secret key** (or legacy service*role key) → `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never prefix with `VITE*`
3. Create your first admin user: **Authentication → Users → + New User**, and make sure **Auto Confirm User** is checked, or the account won't be able to sign in until email-confirmed.
4. Run the analytics table SQL (below) in the **SQL Editor**.

### Analytics tables

```sql
-- Page views: one row per visit, with referrer + session grouping
create table page_views (
  id bigint generated always as identity primary key,
  path text not null,
  referrer text,
  session_id uuid,
  created_at timestamptz not null default now()
);

alter table page_views enable row level security;

-- Any visitor can log a view, whether signed in or not
create policy "Allow public insert"
  on page_views for insert
  to anon, authenticated
  with check (true);

-- Only signed-in admins can read the analytics
create policy "Allow authenticated read"
  on page_views for select
  to authenticated
  using (true);

-- Generic events table for click/interaction tracking
create table events (
  id bigint generated always as identity primary key,
  event_name text not null,
  path text not null,
  session_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table events enable row level security;

create policy "Allow public insert"
  on events for insert
  to anon, authenticated
  with check (true);

create policy "Allow authenticated read"
  on events for select
  to authenticated
  using (true);
```

> **Important:** insert policies must cover **both** `anon` and `authenticated` roles. If you're signed into `/admin` while browsing `/` in the same browser (e.g. testing locally, not in an incognito tab), your requests hit the database as `authenticated`, not `anon` — a policy scoped to only one role will silently 403 the other. This is the single most common setup mistake with this template; see [Known gotchas](#known-gotchas).

## Tracking a new page

Add one line to any page component:

```tsx
import { useTrackPageView } from "../hooks/useTrackPageView";

export default function SomePage() {
  useTrackPageView("/some-path");
  // ...
}
```

This automatically captures the path, referrer (excluding your own domain, so internal navigation doesn't get misread as an external source), and a session ID.

## Tracking a custom event

Use `useTrackEvent` for clicks, form submits, or any other interaction you want visibility into:

```tsx
import { useTrackEvent } from "../hooks/useTrackEvent";

function SomeComponent() {
  const trackEvent = useTrackEvent();

  return (
    <Button
      onClick={() => trackEvent("cta_click", "/", { label: "Get Started" })}
    >
      Get Started
    </Button>
  );
}
```

`metadata` is a `jsonb` column, so you can pass any shape of extra detail per event without a schema change.

## What shows up in `/admin`

- **Summary cards** — total views, unique sessions, views in the last 24h
- **Views over time** — line chart, grouped by day (`groupViewsByDay` in `lib/analytics.ts`)
- **Views by page** — bar chart
- **Referrers** — pie chart, grouped by hostname (falls back to "Direct" for empty/same-origin referrers)
- **Events** — table of event counts by name

All charts pull their colors from the active MUI theme (`useTheme()`), so they follow `palette.ts` and adapt automatically between light/dark mode — no separate chart-theme file to maintain.

## Why Supabase-native analytics instead of a third-party service

- **Free with no traffic caps** — it's just rows in the Postgres database the project already has.
- **Lives inside `/admin`** rather than a separate external dashboard.
- **No extra signup or service** to configure per project.

**Known limitations:**

- Unique _sessions_ ≠ unique _people_ — the same person across two devices/browsers counts twice. There's no fingerprinting, by design (avoids the privacy/legal complexity that comes with it).
- Referrer data is inherently incomplete — some browsers (Safari, Firefox) increasingly strip or truncate cross-origin referrers for privacy, so "Direct" is often inflated beyond true direct visits.
- Time-on-page is not implemented. It's technically possible via `visibilitychange` + `fetch(..., { keepalive: true })` (not `sendBeacon`, since Supabase's REST API requires an `apikey` header that `sendBeacon` can't attach), but was deliberately skipped for now — approximate at best, and adds meaningful complexity for a personal-scale project.

## Known gotchas

- **RLS insert policies need both `anon` and `authenticated` roles.** See the callout in [Setting up Supabase](#setting-up-supabase) above — this is the #1 cause of `42501: new row violates row-level security policy` errors when testing locally while signed in.
- **MUI `color` prop**: `color="secondary.main"` on `Typography` only works inside `sx={{}}`. The bare `color` prop only accepts short named values like `"secondary"`.
- **`import.meta.env` type errors**: requires `src/vite-env.d.ts` with `/// <reference types="vite/client" />`. Missing this file causes `Property 'env' does not exist on type 'ImportMeta'` even though it works fine at runtime.
- **White screen on load**: almost always an unset `.env` value — `supabase.ts` throws if `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing, which crashes the whole render tree since `AuthProvider` wraps the app root. Check the browser console first.
- **ESLint and `process` undefined**: `server/**/*.js` needs `globals.node` in `eslint.config.js`, scoped separately from the frontend's `globals.browser` block (see `eslint.config.js` in this repo for the split).
- **Local dev traffic pollutes analytics** — every reload while developing counts as a real page view. Either accept it (personal project, low stakes) or periodically `delete from page_views;` / `delete from events;` in the SQL Editor while iterating.

## Theming

`palette.ts` defines both `light` and `dark` color schemes. Beyond `primary`/`secondary`/`background`/`text`, this template also relies on:

- `success`, `warning`, `info` — used as the chart color rotation for the referrer pie chart, in addition to normal MUI usage (`Alert`, etc.)
- `action.hover` — used for table row striping in `/admin`, since MUI's default hover overlay is tuned for a plain white/gray background and can read as invisible against custom theme colors

Since charts and tables both pull from `theme.palette.*` at render time via `useTheme()`, any edit to `palette.ts` — including adding a new named color or changing existing values — propagates through the admin dashboard automatically. No chart-specific or table-specific styling file to keep in sync.

## Roadmap ideas (not yet implemented)

- Catch-all `*` route → redirect to `/` or a dedicated 404 page
- Time-on-page tracking (see [Known limitations](#why-supabase-native-analytics-instead-of-a-third-party-service) above)
- `concurrently` script to run frontend + backend with one command
- Reusable `<ThemedTable>` component to avoid repeating row-striping/header `sx` props across future tables
