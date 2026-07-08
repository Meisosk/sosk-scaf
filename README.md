# sosk-scaf

A personal, opinionated Vite + React (TypeScript) scaffold with MUI theming, Supabase-backed auth, an admin panel, and built-in page analytics — all baked in as a single fixed template (no variants).

Generated via [`create-sosk-scaf`](https://github.com/Meisosk/create-sosk-scaf):

```bash
npx create-sosk-scaf
```

## Stack

- **Vite + React + TypeScript**
- **MUI** with a `cssVariables: true` theme (light/dark color schemes) — `palette.ts` is the only file a customizer needs to touch
- **React Router** for client-side routing
- **Supabase** for auth (and analytics storage)
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
│   └── supabase.ts          → Supabase client (browser, anon key)
├── contexts/
│   └── AuthContext.tsx      → session state, signIn/signOut
├── components/
│   └── ProtectedRoute.tsx   → redirects to /signin if not authenticated
├── hooks/
│   └── useTrackPageView.ts  → logs a page view to Supabase on mount
├── pages/
│   ├── SignIn.tsx           → /signin
│   ├── Admin.tsx            → /admin (protected, shows analytics)
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

### Analytics table

```sql
create table page_views (
  id bigint generated always as identity primary key,
  path text not null,
  created_at timestamptz not null default now()
);

alter table page_views enable row level security;

create policy "Allow public insert"
  on page_views for insert
  to anon
  with check (true);

create policy "Allow authenticated read"
  on page_views for select
  to authenticated
  using (true);
```

This lets any visitor log a page view, but only authenticated users (i.e. you, signed into `/admin`) can read the results.

## Tracking a new page

Add one line to any page component:

```tsx
import { useTrackPageView } from "../hooks/useTrackPageView";

export default function SomePage() {
  useTrackPageView("/some-path");
  // ...
}
```

Views show up automatically in the `/admin` traffic table — no other wiring needed.

## Why Supabase-native analytics instead of a third-party service

- **Free with no traffic caps** — it's just rows in the Postgres database the project already has.
- **Lives inside `/admin`** rather than a separate external dashboard.
- **No extra signup or service** to configure per project.

Current limitation: every insert counts as a raw pageview, including repeat visits from the same person. Unique-visitor tracking would need a session/cookie ID or IP-hash column — not implemented yet.

## Known gotchas

- **MUI `color` prop**: `color="secondary.main"` on `Typography` only works inside `sx={{}}`. The bare `color` prop only accepts short named values like `"secondary"`.
- **`import.meta.env` type errors**: requires `src/vite-env.d.ts` with `/// <reference types="vite/client" />`. Missing this file causes `Property 'env' does not exist on type 'ImportMeta'` even though it works fine at runtime.
- **White screen on load**: almost always an unset `.env` value — `supabase.ts` throws if `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing, which crashes the whole render tree since `AuthProvider` wraps the app root. Check the browser console first.
- **ESLint and `process` undefined**: `server/**/*.js` needs `globals.node` in `eslint.config.js`, scoped separately from the frontend's `globals.browser` block (see `eslint.config.js` in this repo for the split).

## Roadmap ideas (not yet implemented)

- Catch-all `*` route → redirect to `/` or a dedicated 404 page
- Unique-visitor tracking (session/cookie or IP-hash based)
- `concurrently` script to run frontend + backend with one command
