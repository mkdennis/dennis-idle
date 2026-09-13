import { and, eq, gte, inArray, isNull, lte, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { DAY_CLEAR, EFFORT_COINS, EFFORT_XP, type Effort } from "@/config/game";
import { dayKeyFor, dayOfMonthOfKey, shiftKey, weekStartKey, weekdayOfKey, type DayKey } from "@/lib/game/time";
import { getTimeZone } from "./settings";
import { dayClearState } from "@/lib/game/day-clear";

export { dayClearState };

export async function currentDayKey(now = new Date()): Promise<DayKey> {
  return dayKeyFor(now, await getTimeZone());
}

/** Count of done missions for a habit in the week containing `dayKey`, excluding `dayKey` itself when asked. */
export async function habitDoneThisWeek(habitId: number, dayKey: DayKey): Promise<number> {
  const start = weekStartKey(dayKey);
  const end = shiftKey(start, 6);
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.missions)
    .where(
      and(
        eq(schema.missions.habitId, habitId),
        eq(schema.missions.status, "done"),
        gte(schema.missions.dayKey, start),
        lte(schema.missions.dayKey, end),
      ),
    );
  return rows[0]?.n ?? 0;
}

function habitDueOn(habit: typeof schema.habits.$inferSelect, dayKey: DayKey, doneThisWeek: number): boolean {
  if (habit.monthDay != null) return dayOfMonthOfKey(dayKey) === habit.monthDay;
  const target = habit.weeklyTarget ?? 1;
  if (doneThisWeek >= target) return false;
  const days = habit.preferredDays ?? [];
  if (days.length === 0) return true;
  return days.includes(weekdayOfKey(dayKey));
}

/**
 * Ensure today's mission list exists: one row per due habit and per task planned for the day.
 * Idempotent; safe to call on every page load and from the cron.
 */
export async function materializeDay(dayKey: DayKey): Promise<void> {
  await db.insert(schema.days).values({ dayKey }).onConflictDoNothing();

  const existing = await db.query.missions.findMany({ where: eq(schema.missions.dayKey, dayKey) });
  const haveHabit = new Set(existing.filter((m) => m.habitId != null).map((m) => m.habitId));
  const haveTask = new Set(existing.filter((m) => m.taskId != null).map((m) => m.taskId));

  const activeHabits = await db.query.habits.findMany({ where: eq(schema.habits.active, true) });
  for (const h of activeHabits) {
    if (haveHabit.has(h.id)) continue;
    const done = await habitDoneThisWeek(h.id, dayKey);
    if (!habitDueOn(h, dayKey, done)) continue;
    await db.insert(schema.missions).values({
      dayKey,
      sourceType: "habit",
      habitId: h.id,
      title: h.title,
      areaId: h.areaId,
      xp: EFFORT_XP[h.effort],
      coins: EFFORT_COINS[h.effort],
    });
  }

  const dueTasks = await db.query.tasks.findMany({
    where: and(eq(schema.tasks.plannedFor, dayKey), isNull(schema.tasks.completedAt)),
  });
  for (const t of dueTasks) {
    if (haveTask.has(t.id)) continue;
    await db.insert(schema.missions).values({
      dayKey,
      sourceType: "task",
      taskId: t.id,
      title: t.title,
      areaId: t.areaId,
      xp: EFFORT_XP[t.effort],
      coins: EFFORT_COINS[t.effort],
    });
  }
}

export interface CompleteResult {
  xp: number;
  coins: number;
  areaId: string;
}

/** Mark a mission done and pay out XP and coins. No-op if already done. */
export async function completeMission(
  missionId: number,
  meta: Record<string, unknown> = {},
  when = new Date(),
): Promise<CompleteResult | null> {
  const m = await db.query.missions.findFirst({ where: eq(schema.missions.id, missionId) });
  if (!m || m.status === "done") return null;

  await db.transaction(async (tx) => {
    await tx
      .update(schema.missions)
      .set({ status: "done", completedAt: when, meta: { ...m.meta, ...meta } })
      .where(eq(schema.missions.id, missionId));
    await tx
      .update(schema.areas)
      .set({ xp: sql`${schema.areas.xp} + ${m.xp}` })
      .where(eq(schema.areas.id, m.areaId));
    await tx.insert(schema.xpEvents).values({ areaId: m.areaId, amount: m.xp, reason: "mission", missionId, dayKey: m.dayKey });
    await tx.insert(schema.coinEvents).values({ amount: m.coins, reason: `mission:${missionId}`, dayKey: m.dayKey });
    if (m.taskId != null) {
      await tx.update(schema.tasks).set({ completedAt: when }).where(eq(schema.tasks.id, m.taskId));
    }
  });
  return { xp: m.xp, coins: m.coins, areaId: m.areaId };
}

export async function skipMission(missionId: number): Promise<void> {
  await db.update(schema.missions).set({ status: "skipped" }).where(and(eq(schema.missions.id, missionId), eq(schema.missions.status, "open")));
}

export async function reopenMission(missionId: number): Promise<void> {
  await db.update(schema.missions).set({ status: "open" }).where(and(eq(schema.missions.id, missionId), eq(schema.missions.status, "skipped")));
}

/** Claim the Day Clear capstone: coins + XP to the lowest-level touched area. Returns false if not claimable. */
export async function claimDayClear(dayKey: DayKey): Promise<boolean> {
  const day = await db.query.days.findFirst({ where: eq(schema.days.dayKey, dayKey) });
  const ms = await db.query.missions.findMany({ where: eq(schema.missions.dayKey, dayKey) });
  const state = dayClearState(ms, day?.clearedAt ?? null);
  if (!state.claimable) return false;

  const touchedIds = [...new Set(ms.filter((m) => m.status === "done").map((m) => m.areaId))];
  const touched = touchedIds.length ? await db.query.areas.findMany({ where: inArray(schema.areas.id, touchedIds) }) : [];
  const target = touched.sort((a, b) => a.xp - b.xp)[0];

  await db.transaction(async (tx) => {
    await tx.update(schema.days).set({ clearedAt: new Date() }).where(eq(schema.days.dayKey, dayKey));
    await tx.insert(schema.coinEvents).values({ amount: DAY_CLEAR.coins, reason: "day_clear", dayKey });
    if (target) {
      await tx.update(schema.areas).set({ xp: sql`${schema.areas.xp} + ${DAY_CLEAR.xp}` }).where(eq(schema.areas.id, target.id));
      await tx.insert(schema.xpEvents).values({ areaId: target.id, amount: DAY_CLEAR.xp, reason: "day_clear", dayKey });
    }
  });
  return true;
}

export async function addTaskForDay(title: string, areaId: string, effort: Effort, dayKey: DayKey): Promise<void> {
  const [t] = await db.insert(schema.tasks).values({ title, areaId, effort, plannedFor: dayKey }).returning();
  await db.insert(schema.missions).values({
    dayKey,
    sourceType: "task",
    taskId: t.id,
    title,
    areaId,
    xp: EFFORT_XP[effort],
    coins: EFFORT_COINS[effort],
  });
}
