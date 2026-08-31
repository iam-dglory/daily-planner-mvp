# Daily Planner — app

A mobile-first Daily Planner / To-Do List MVP: sign up, add tasks with priority/due date/time,
mark them done, repeat them on a schedule, browse a calendar, organize by list/category, and
tweak per-account feature flags — all backed by a live Supabase project.

## Tech stack

- **React 19 + TypeScript**, scaffolded with Vite
- **Tailwind CSS v4** (`@tailwindcss/vite` plugin) for styling
- **`@supabase/supabase-js` v2** for auth + Postgres (RLS-protected) data access
- **`react-router-dom` v7** for routing
- **`date-fns`** for date math
- Hand-built month-grid calendar (no calendar library)

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

To build for production:

```bash
npm run build
```

## Environment variables

Copy `.env.example` to `.env` and fill in your Supabase project's values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

The anon key is safe to ship client-side — Row Level Security on `profiles`, `categories`, and
`tasks` is what actually restricts access to each signed-in user's own rows.

## Features

Email/password auth (sign up with display name, log in, log out, session persisted via
supabase-js/localStorage, protected routes); a **Today** view with a quick-add bar, priority/time
sort, and a collapsible completed section; an **Upcoming** view grouped into Today / Tomorrow /
This Week / Later / No date; a hand-built **Calendar** month grid with a per-day task-count dot and
a day detail panel, honoring the account's configured week-start day; a full **task edit modal**
covering notes, due date/time, priority, category (with inline category creation), recurrence
(none/daily/weekly/monthly + interval + end date), and reminders; a **Lists** page to
create/rename/delete categories with a color swatch and view tasks per list; a **Settings** page
that toggles `enabled_features` and `week_start_day` on `profiles.settings`, demonstrating
per-tenant configurability (unchecking a feature immediately hides its nav item and view); and
**reminders** via the browser Notification API, polled every 30s client-side.

### Known limitation: reminders

Reminders only fire while this browser tab is open — there is no service worker, push
subscription, or server-side scheduler. A production version would need a backend job (e.g. a
Supabase Edge Function on a cron schedule) pushing via Web Push so users are notified even when
the app is closed. See the comment in `src/lib/reminders.ts`.

Task completion for recurring tasks relies entirely on a database trigger already provisioned on
the `tasks` table: the frontend only sets `is_completed = true` / `completed_at = now()` and
re-fetches — it does not compute the next occurrence itself.
