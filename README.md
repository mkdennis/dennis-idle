# Life OS

A personal life-planning app with the daily loop of an idle RPG: daily missions, a Day Clear capstone, XP and levels per life area, and one composite Life Power number. Design and rules live in `PRD.md`; research in `docs/research/`; the design canvas sources in `design/`.

## Run locally

```bash
cp .env.example .env.local   # then set APP_PASSWORD, SESSION_SECRET, HEVY_API_KEY
npm install
npm run db:up                # Postgres 17 in Docker on port 5433
npm run db:push              # create tables
npm run db:seed              # 8 areas (Health + Money enabled) and the v1 habits
npm run dev                  # http://localhost:3000
```

Log in with `APP_PASSWORD`. The app is a PWA; on iOS use Share → Add to Home Screen.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm test` | Vitest unit tests (level curve, Life Power, reset boundaries, Day Clear rules, sessions) |
| `npm run lint:fix` | ESLint |
| `npm run db:up` | Start local Postgres |
| `npm run db:push` | Apply `src/db/schema.ts` to the database |
| `npm run db:seed` | Idempotent seed of areas and habits |
| `npm run db:studio` | Drizzle Studio |

## How it works

- **Game day** starts at 04:00 local (`APP_TIMEZONE`, overridable in Me → Settings). Late nights count toward the same day.
- **Missions** are materialized on first page load of each day from active habits (weekly targets, preferred weekdays, or a day of month) and tasks planned for that day. Everything tunable is in `src/config/game.ts`.
- **Day Clear** unlocks when at least `minDone` missions are done and none are left open. It pays coins and XP to the lowest touched area, and counts toward the month's attendance multiplier.
- **Hevy**: with `HEVY_API_KEY` set, the app polls Hevy's public API at most every 15 minutes on page load (and from `/api/cron`). A workout of 60+ minutes completes that day's gym mission; a body-weight entry completes the week's weight mission.
- **Auth**: single user. `APP_PASSWORD` plus an HMAC-signed cookie (`SESSION_SECRET`).

## Deploy (Vercel)

1. `vercel login && vercel link`
2. Add a Neon Postgres from the Vercel Marketplace; it sets `DATABASE_URL`.
3. `vercel env add` for `APP_PASSWORD`, `SESSION_SECRET`, `HEVY_API_KEY`, `APP_TIMEZONE`, `CRON_SECRET`.
4. `npm run db:push` against the Neon URL, then `npm run db:seed`.
5. `vercel deploy --prod`. The cron in `vercel.json` runs `/api/cron` daily after the reset.
