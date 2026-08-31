# Daily Planner — MVP submission

A working Daily Planner / To-Do List web app (reference: the Google Play "Daily Planner / To-Do
List" app category), built as a take-home assignment for LumosLogic.

**Live app repo:** `app/` (React + TypeScript + Supabase)
**Backend:** a live, provisioned Supabase project (Postgres + Auth), schema in `supabase/migrations/`
**Full technical write-up:** see [`ARCHITECTURE.md`](./ARCHITECTURE.md) — data model, API design,
configurability, security, scalability, deployment, assumptions, and limitations.

## Quick start

```bash
cd app
npm install
npm run dev
```

The app is pre-wired (via `app/.env`) to a live Supabase project, so it works immediately —
sign up with any email/password and start adding tasks. No backend setup required to try it.

To build for production: `npm run build` (output in `app/dist/`, deployable to any static host —
see [`ARCHITECTURE.md`](./ARCHITECTURE.md#deployment) for one-click Vercel/Netlify steps).

## What's in this submission

| Deliverable | Where |
|---|---|
| Working application (source) | `app/` — run with `npm run dev` |
| Verification screenshots (signed-up flow, tasks, recurrence, calendar, settings) | `app/verification-screenshots/` |
| Source code repository | this folder (git-initialized; see `git log`) |
| Technical documentation / architecture | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| Database / schema design | `supabase/migrations/` (raw SQL, applied as-is to the live project) |
| API & integration details | [`ARCHITECTURE.md`](./ARCHITECTURE.md#api--integration-details) |
| Deployment / setup instructions | [`ARCHITECTURE.md`](./ARCHITECTURE.md#deployment) |
| Assumptions & technical decisions | [`ARCHITECTURE.md`](./ARCHITECTURE.md#key-assumptions--technical-decisions) |
| Limitations & future improvements | [`ARCHITECTURE.md`](./ARCHITECTURE.md#limitations--future-improvements) |

## Feature summary

Email/password auth · Today / Upcoming / Calendar views · task priority, due date & time,
notes · categories (lists) with color · recurring tasks (daily/weekly/monthly, DB-driven) ·
in-app + browser-notification reminders · per-account settings that demonstrate
multi-customer configurability (feature flags, week-start day).
