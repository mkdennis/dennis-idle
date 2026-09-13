# Life OS — Product Requirements (v1.0)

**Status:** Ready for implementation. Scope narrowed for v1 to **two active areas: Health (fitness) and Money**. The other six areas exist in the data model but are hidden until Dennis turns them on. Fitness syncs from Hevy. Money starts manual-but-minimal in v1 and moves to bank-linked (Plaid) in Phase 2.

**Design principle (from Dennis):** no streaks anywhere. The unit of consistency is the **week**. The reward for a good week is leveling up or treating yourself from the Shop.
**Author:** Dennis + Claude. **Date:** 2026-09-13.
**Research basis:** `docs/research/maplestory-idle.md`.

---

## 1. Problem

Goals, priorities, and progress are scattered across tools and notes. There is no single place that answers, in under a minute, three questions:

1. What exactly do I need to do **today**?
2. Am I **on track** this week / this month?
3. How is my life going **overall**, and which area is being left behind?

MapleStory Idle answers the equivalent questions for a game character with a daily mission list, an EXP bar, and a single Combat Power number. This product borrows that loop wholesale and points it at real life.

## 2. Goals and non-goals

**Goals**
- A daily check-in that takes 3–5 minutes and feels complete when done (a real "day cleared" moment).
- Consistency measured per week, never by consecutive days. Missing a day costs nothing but that day's XP.
- One composite number (Life Power) and one level that go up on every meaningful action.
- Eight life areas as visible stats, so neglect is obvious and balance is rewarded.
- Goals with milestones that feel like stages and bosses, not a backlog.
- Mobile-first: opened on the phone every morning and night like the game.

**Non-goals (v1)**
- Multi-user, social, sharing, leaderboards.
- Integrations other than Hevy in v1. Plaid (bank linking) is Phase 2; Todoist and Google Calendar later. Hevy is in v1 because it removes all manual logging for the fitness area.
- Time tracking, calendars, notes, or journaling as first-class features.
- Any paid currency or monetization mechanics.

## 3. The metaphor, mapped

| Game concept | Life OS concept | Notes |
|---|---|---|
| Character | You | One character, one save |
| Character sprite | **Avatar** | Simple figure that evolves at level tiers (Lv 1 / 5 / 10 / 20 / 35 / 50) |
| Character level + green EXP bar | **Level** + XP bar | XP from every completed mission |
| Combat Power (CP) | **Life Power (LP)** | Published formula, delta shown on every action |
| Stats (STR/DEX/…) | **8 Life Areas**, each with its own level | v1 active: **Health, Money**. Hidden until enabled: Career, Relationships, Learning, Mind, Creative, Home |
| Daily Missions "0/8 → Claim" | **Today's Missions** + **Day Clear** capstone | Habits due today + tasks planned today + one Guide Quest step |
| Guide Quest (top-left, one line) | **Next Step** | Always exactly one recommended action |
| Stage Breakthrough / Boss | **Milestone** / **Goal completion** | Goals are chapters, milestones are stages |
| Challenge indicator ("needs more CP") | **Area-level gate on a goal** | Soft signal, never a hard block |
| Monthly Attendance (cumulative Day 1–28) | **Attendance Board** | Credited by claiming Day Clear; missed days delay, not break |
| Weekly reset + weekly shop | **Weekly Missions** + **Weekly Review** | Monday reset |
| Red Diamonds (earned) | **Coins** | Spent in a self-defined Reward Shop |
| Offline rewards popup | **Since-you-left recap** | What auto-progressed while you were away (v1: light) |
| Red dots | **Context-aware badges** | Only when there is something to claim or do |
| Level-up unlocks new systems | **Level-gated features** | Keep v1 simple; unlock Weekly, Shop, Goals progressively |

## 4. Core objects

**Life Area** (fixed set of 8, user can rename/reorder/enable). Has `xp`, derived `level`, `last_touched_at`, `enabled`. LP and the balance factor only consider enabled areas, so two areas in v1 does not make LP look broken.

**Habit** — recurring mission. Fields: title, area, **weekly target** (N times per week, 1–7), optional preferred weekdays (only affects which days it is suggested on), difficulty (S/M/L → XP 10/25/50), optional target quantity (e.g. "read 20 pages"), active flag. Shows on Home as `2/4 this week`. Suggested as a Mission on preferred days, or every day until the weekly target is met.

**Task** — one-off. Fields: title, area, difficulty, optional due date, optional goal/milestone link, `planned_for` date. Appears as a Mission on the day it is planned for.

**Goal** — a chapter. Fields: title, area, target date, optional required area level (the "recommended CP"), ordered **Milestones**. A milestone is a stage; the final milestone is the boss. Completing a goal grants a large XP bonus plus a permanent LP multiplier (the "inventory effect": finished goals keep paying).

**Measured Goal** — a Goal whose milestones are numeric targets on a tracked metric rather than tasks (e.g. body fat 22% → 18%). Fields: metric (`weight_kg`, `body_fat_pct`, `lean_mass_kg`, `bmi`, or a money metric), direction (down/up), baseline, target, and intermediate milestones auto-split into 3–5 stages. A new metric reading that crosses a milestone completes it and fires the same stage-clear celebration. The final milestone is the boss. "Look better" becomes a chapter with measurable stages.

**Metric Reading** — a dated value for a metric, from Hevy sync or manual entry.

**Mission** — a row on today's list. Generated from habits, tasks, and the Next Step. States: `open`, `done`, `skipped`. Done missions grant XP to their area and Coins. Missions are wiped at daily reset (game behavior), but done ones are recorded in history.

**Day** — one row per calendar day: mission count, done count, `cleared_at` (Day Clear claimed), LP snapshot, level snapshot.

**Attendance Board** — cumulative Day 1…28 per month, not consecutive. Advances only when Day Clear is claimed. Milestone tiles at 7/14/21/28 pay extra Coins. There is nothing to "break": a missed day just means the next clear lands on the next tile. No recovery mechanic needed.

**Reward** — self-defined shop item (e.g. "Order sushi", "Buy that game", "Lazy Sunday") with a Coin price. Purchasing records a redemption; nothing more.

## 5. The numbers

Everything below is tunable in one config file. Values are starting points.

**XP per mission:** S=10, M=25, L=50. No streak multipliers.

**Weekly target bonus:** when a habit hits its weekly target, it pays a bonus equal to one extra completion's XP plus 25 Coins, claimed by tap on the Week screen (or auto-claimed at weekly reset). Exceeding the target earns normal XP but no further bonus, so there is no pressure to over-do.

**Area level:** level `n` requires `100 × n^1.5` cumulative XP (Lv2 at 283, Lv5 at 1118, Lv10 at 3162). Slow enough that a level is a week-ish of effort early on.

**Character level:** from total XP across areas, same curve × 4. Level primarily unlocks features (below).

**Life Power:**

```
LP = Σ(area_level × 100)
     × (1 + 0.02 × days_cleared_this_month)                // showing up (max 28)
     × (1 + 0.05 × goals_completed)                        // inventory effect
     × balance_factor                                       // 0.85–1.0
```

`balance_factor` = 1 − 0.15 × (share of areas untouched in the last 7 days). Touch every area weekly and it is 1.0. This is what makes neglect visible without punishing it hard.

**LP delta** is computed and shown on every completed mission ("+12 LP"), just like the game shows CP gain on every upgrade.

**Day Clear:** claimable when `done ≥ 8` (fixed, like the game's 0/8; overridable in settings). Plan must therefore contain at least 8 missions; the Plan screen warns if it doesn't. Pays 100 Coins + 50 XP to the least-leveled touched area, and credits the Attendance Board. Only Day Clear credits attendance; individual missions never do.

**Daily reset:** 04:00 local, not midnight, so late nights count toward the same day. A countdown to reset is always visible on Home.

**Weekly reset:** Monday 04:00. **Weekly Missions** are the real scoreboard: a fixed set of 5 generated each Monday, e.g. "Clear 5 days", "Hit all habit weekly targets", "Touch all 8 areas", "Complete 1 milestone", "Earn 600 XP". Each pays Coins; completing all 5 pays a **Week Clear** bonus (300 Coins + a full-screen celebration). Week Clear is the moment you are meant to go buy something in the Shop.

## 6. Screens (mobile-first, one thumb)

### Home (the only screen that matters)

```
┌────────────────────────────────────┐
│ 🧑 Lv 12   LP 4,820 (+35 today)  ⚙  │  ← avatar tier 3 (Lv 10–19)
│ ████████████░░░░  1,240/1,800 XP   │  ← character EXP bar (green)
│ Reset in 9h 14m         🗓 Day 11  │  ← daily countdown + attendance
├────────────────────────────────────┤
│ ▶ NEXT STEP                        │
│   Write outline for talk (Career)  │  ← Guide Quest: exactly one line
├────────────────────────────────────┤
│ TODAY'S MISSIONS            6/8    │
│ ☑ Workout 45m     3/4wk Health +25 │
│ ☑ Read 20 pages   5/7wk Learn.  +10 │
│ ☑ Meditate 10m            Mind +10 │
│ ☐ Call mom          Relations  +10 │
│ ☐ Pay credit card         Money +10│
│ ☐ Write outline          Career +50│
│ ...                                │
│ [   CLAIM DAY CLEAR  🔒 2 more   ] │  ← capstone, becomes gold when unlocked
├────────────────────────────────────┤
│ AREAS                              │
│ Health 7 ██████░  Career 9 ████░░  │
│ Money  5 ███░░░░  Relat. 3 █░░░░░  │  ← dim + badge when untouched 7 days
│ ...                                │
└────────────────────────────────────┘
  [Home] [Goals] [Week] [Shop] [Me]
```

Interactions: tap a mission to mark done (satisfying tick + "+25 XP, +12 LP" toast). Long-press to skip or edit. Day Clear tap fires a short celebration and advances the attendance tile. Level-up fires a full-screen banner once.

### Plan (evening or morning)
Suggested missions for tomorrow: scheduled habits pre-checked, tasks due soon, Next Step, and "area maintenance" nudges for areas untouched 5+ days. Pick until you have 8–12. Cap at 12 to protect the 3–5 minute session (Nexon's fatigue lesson).

### Goals
Chapter list. Each goal shows milestone stages as a horizontal stage strip (1-1, 1-2, … boss), area, target date, and a "Challenge" pill if area level < required. Tapping a milestone lets you add tasks to it or mark it complete.

### Week
The second most important screen. Top: 5 Weekly Missions with claim buttons and the Week Clear capstone. Then: each habit's `done/target` bar for the week with its bonus claim, last 7 days as tiles (cleared / partial / miss), area touch heatmap, LP sparkline. Weekly Review card (Phase 3): 3 prompts (what moved LP most, what area was neglected, one thing to change) saved as text.

### Attendance / Me
28-tile monthly board (cumulative days, milestone tiles highlighted, Recover button on gaps), lifetime stats, level-unlock ladder, LP formula shown in plain language with your live numbers plugged in.

### Shop
Your reward list with Coin prices and a balance. Purchase = confirm sheet. Redemption history.

### Avatar
A single small figure on Home and Me. Six tiers keyed to level bands (1–4, 5–9, 10–19, 20–34, 35–49, 50+). Each tier is one static illustration (SVG or emoji composition in v1; can be swapped for pixel art later). A tier change is part of the level-up banner ("Your avatar evolved"). No gear, no animation in v1.

## 7. Level-gated unlocks (v1)

| Level | Unlocks |
|---|---|
| 1 | Home, Plan, Habits, Tasks, Areas, Day Clear, Attendance, Week (missions + targets), Shop |
| 3 | Goals & Milestones, Next Step |
| 6 | Weekly Review, Special Requests (timed optional missions) |
| 10 | Since-you-left recap |

Week and Shop are core to the "reward yourself for a good week" loop, so they are available from Lv 1. Unlocks can be disabled in settings.

## 8. Badges and notifications

Badge rules are explicit, per the game's own bug-fix history:
- Day Clear button: badge only when claimable and unclaimed.
- Attendance tab: badge only when a tile is claimable.
- Areas: subtle badge when untouched 7+ days.
- Week tab: badge when a weekly mission or habit weekly-target bonus is complete and unclaimed.

Push notifications (web push, later): one at a configurable morning time ("8 missions today"), one 2h before reset if Day Clear is unclaimed and reachable. Nothing else.

## 9. Hevy integration (v1)

**What Hevy exposes (verified):** a public API gated on Hevy Pro, authenticated with an `api-key` header from hevy.com/settings?developer. `GET /v1/workouts` (paginated, with `start_time`, `end_time`, title, exercises and sets), `GET /v1/workouts/events?since=` for polling updates and deletes, and body measurements with weight, body fat %, lean mass and circumferences. No delete endpoints; webhooks are not documented, so we poll.

**How it plugs in**
- **Sync job:** Vercel cron every 30 minutes calls the events endpoint since the last sync cursor, upserts workouts into a `workouts` table, and pulls body measurements into Metric Readings. Manual "Sync now" button on Home.
- **Gym habit auto-completes:** a synced workout with `end_time − start_time ≥ 60 min` marks today's "Gym session" mission done and grants its XP. Shorter sessions show as a partial ("42 min, not counted") so the rule is visible, not silent. The mission can still be ticked by hand if you trained without Hevy.
- **Body-composition goal auto-advances:** new weight / body fat / lean mass readings from Hevy flow into the Measured Goal and can complete milestones. BMI is derived from weight and a stored height.
- **Failure mode:** if Hevy is unreachable, missions stay manual. Sync status and last-sync time shown on Me.
- **Config:** `HEVY_API_KEY` in Vercel env. Never in code.

## 10. Money integration

**What was checked (2026-09-13)**
- *Finances in ChatGPT* is a consumer feature for ChatGPT Plus/Pro in the US. It links banks through Plaid and shows spending, subscriptions, portfolio and upcoming payments. It exposes **no API, export, or connector**, so a third-party app cannot read it. It can't feed this OS.
- *Copilot Money* has no public API; CSV export only.
- *Plaid* (the same rails ChatGPT uses) now has a **free Trial plan for new teams: 10 real production accounts, no expiry stated**, including Transactions, Balance, Investments and Liabilities. That is enough for one person's checking, credit cards, and brokerage. Requires creating a Plaid dashboard account and filling in the trial application.

**v1 (manual but 20 seconds a week)**
- **Weekly budget review** (M, Sunday): the mission opens a sheet with one field, "spent this week", and a link that deep-opens Copilot or ChatGPT. Enter the number, tick done. The number is stored as a Metric Reading (`weekly_spend`) so the Week screen can chart it.
- **Monthly contribution** (L, 1st of month): "Transfer $X to investing". Tick when sent. Amount configurable.
- **Net worth update** (M, 1st of month): one field, stored as `net_worth`. Feeds a Measured Goal with stages at round numbers.

**Phase 2 (bank-linked, zero typing)**
- Plaid Link flow inside Me → Money. Nightly cron pulls transactions, balances, investment holdings and liabilities.
- Weekly budget review becomes a *review*: the sheet is pre-filled with last week's spend by category and the biggest transactions; you confirm, and the mission completes. Still a human tick, so the ritual stays.
- Net worth computes itself from balances; the monthly mission becomes "confirm net worth", pre-filled.
- Monthly contribution auto-completes when a transfer to the brokerage account is detected.
- Money data stays in your Postgres. Plaid access tokens live in env/DB encrypted, never in code.

## 11. Tech (proposed)

- **Next.js (App Router) + TypeScript**, Tailwind + shadcn/ui, deployed on Vercel. PWA manifest so it installs to the home screen.
- **Neon Postgres** via Vercel Marketplace, **Drizzle ORM**, migrations in repo.
- **Auth:** single user. Simplest safe option is a passkey/password gate with a signed session cookie and the secret in env. Clerk from the marketplace is the alternative if you want magic links without writing auth.
- **Daily reset logic** runs on read (compute "today" from user timezone and 04:00 boundary) plus a Vercel cron at 04:05 to materialize missions and snapshot the day, so history is exact even on days you never open the app.
- **Config:** all tuning numbers in `config/game.ts`.
- Tests colocated, Vitest. Formula and reset logic get the most tests (boundaries: 03:59 vs 04:00, month rollover, 28th tile, 0 missions).

## 12. Phasing

**Phase 1 — The loop (ship first, use daily for a week before building more)**
Areas, Habits with weekly targets, Tasks, Plan screen, Today's Missions, XP/Level/LP with live delta, Day Clear, Attendance Board, Weekly Missions + Week Clear, Reward Shop, daily + weekly reset via cron, avatar tiers 1–2, env-password auth, Hevy sync (workouts + body measurements), Measured Goals. Only Health and Money enabled. Seeded from the list in §15.

**Phase 2 — Direction and bank linking**
Plaid integration (transactions, balances, net worth, auto-completing money missions). Task-based Goals and Milestones, Next Step, Challenge gates, goal-completion LP multiplier, enabling the remaining six areas.

**Phase 3 — Polish**
Weekly Review, level-gated unlocks, push notifications, avatar tiers 3–6, Special Requests.

**Phase 4 — Later**
Since-you-left recap, Todoist/Calendar import, data export.

## 13. Success criteria

- You open it on 12 of the first 14 days without being reminded.
- Week Clear achieved in week 2 or 3.
- You buy yourself at least one Shop reward in the first month.
- You can say which area is weakest without thinking.
- Daily session ≤ 5 minutes.

## 14. Decisions log

| # | Question | Decision |
|---|---|---|
| 1 | Platform / data / game feel | Mobile-first PWA, Neon Postgres single user, full game skin |
| 2 | Integrations | None in v1; Todoist/Calendar import in Phase 4 |
| 3 | Day Clear threshold | Fixed 8 missions, settings override |
| 4 | Economy | Coins + self-defined Reward Shop, available from Lv 1 |
| 5 | Character | Simple avatar, six tiers by level band |
| 6 | Streaks | **None.** Habits have weekly targets; the week is the unit of consistency |
| 7 | Reset | Daily 04:00 local, weekly Monday 04:00 local |
| 8 | Areas | All 8: Health, Career, Money, Relationships, Learning, Mind, Creative, Home |
| 9 | Auth | Env password + signed session cookie |
| 10 | Seed data | Dennis supplies a list of habits/goals; baked into a seed script |
| 11 | v1 scope | Two areas only: Health (fitness) and Money. Others hidden |
| 12 | Hevy | In v1 (needs Hevy Pro). Poll-based sync; gym habit auto-completes on a ≥60 min workout |
| 13 | Body data | Weight only for now (weight + BMI); body fat later when a source exists |
| 14 | Gym target | 3 sessions = weekly target, 4th pays a half bonus |
| 15 | Money v1 | Weekly budget review (Sunday), monthly contribution (1st), monthly net worth (1st). Manual, one number each |
| 16 | Money Phase 2 | Plaid free trial plan links banks directly; ChatGPT Finances has no API |
| 17 | Hevy Pro | Yes. Sync ships in Phase 1 |
| 18 | Plaid timing | Phase 2, after the daily loop is proven |
| 19 | Budget review field | One number: spent this week |

## 15. Open

Nothing blocking. Monthly contribution amount, height, current and target weight, and net worth baseline are entered in the app on first run.

## 16. Seed data (v1)

### Health
- **Habit:** Gym session, ≥ 60 min. Weekly target 3; a 4th session pays a half-size second bonus. Effort L (50 XP). Auto-completed from Hevy within 30 minutes of finishing a workout.
- **Measured Goal:** "Look better" chapter. v1 metric: weight (from Hevy body measurements or manual), with BMI derived from stored height. Body fat % and lean mass added when there is a source. Baseline and target TBD on first run (the app asks for current weight, height, and target weight, then splits stages).

### Money
- **Habit:** Weekly budget review, Sunday, effort M (25 XP). One field: spent this week.
- **Habit:** Monthly contribution, 1st of month, effort L (50 XP). Amount TBD (set in app).
- **Habit:** Net worth update, 1st of month, effort M (25 XP). One field: net worth.
- **Measured Goal:** Net worth milestones. Baseline entered on first run; stages at the next 4 round numbers (e.g. every $25k or $50k depending on baseline).

### Shop (Coin prices are placeholders until we see real Coin income after week 1)
| Reward | Price |
|---|---|
| Golf lesson | 600 |
| New gear / equipment | 1,200 |
| Clothes | 800 |
| An experience (dinner, trip, event) | 1,500 |
