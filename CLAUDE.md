# Life OS — project notes for Claude

- Product spec: `PRD.md` (decisions log at the bottom). Research: `docs/research/maplestory-idle.md`. Design canvas sources: `design/*.dc.html`.
- Stack: Next.js 16 App Router, TypeScript, Tailwind v4, Drizzle + postgres.js, Vitest. Single-user auth in `src/lib/auth.ts` and `src/proxy.ts`.
- All tunable game numbers live in `src/config/game.ts`. Pure game math in `src/lib/game/` (tested). DB-touching logic in `src/lib/services/`.
- No streaks anywhere. Consistency is per week (habit weekly targets) and per month (days cleared). Do not add streak mechanics.
- Colors are the MapleStory Idle reference system, defined as CSS variables in `src/app/globals.css`. Cyan = go, lime = claim, gray = locked/in progress, gold = progress bars.
- Local DB: `npm run db:up` (Docker, port 5433). Schema changes: edit `src/db/schema.ts`, then `npm run db:push`.
- Verify UI changes by building and screenshotting at 390×844 (headless Chrome via CDP worked; see git history for the script pattern).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
