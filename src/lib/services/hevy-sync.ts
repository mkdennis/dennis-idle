import { and, eq, gte, lte } from "drizzle-orm";
import { db, schema } from "@/db";
import { HEVY } from "@/config/game";
import { fetchRecentBodyMeasurements, fetchWorkoutEventsSince, hevyConfigured, workoutMinutes } from "@/lib/hevy/client";
import { dayKeyFor, weekStartKey, shiftKey } from "@/lib/game/time";
import { completeMission, materializeDay } from "./missions";
import { getSetting, getTimeZone, setSetting } from "./settings";

export interface SyncReport {
  workoutsUpserted: number;
  workoutsDeleted: number;
  missionsCompleted: number;
  measurementsAdded: number;
  skipped?: string;
}

/**
 * Pull Hevy changes since the last cursor, store workouts and body measurements,
 * and auto-complete gym / weight missions for the days they belong to.
 */
export async function syncHevy(now = new Date()): Promise<SyncReport> {
  const report: SyncReport = { workoutsUpserted: 0, workoutsDeleted: 0, missionsCompleted: 0, measurementsAdded: 0 };
  if (!hevyConfigured()) return { ...report, skipped: "HEVY_API_KEY not set" };

  const tz = await getTimeZone();
  const cursor =
    (await getSetting("hevy_cursor")) ?? new Date(now.getTime() - HEVY.initialLookbackDays * 86_400_000).toISOString();

  const events = await fetchWorkoutEventsSince(cursor);
  for (const ev of events) {
    if (ev.type === "deleted") {
      await db.delete(schema.workouts).where(eq(schema.workouts.id, ev.id));
      report.workoutsDeleted += 1;
      continue;
    }
    const w = ev.workout;
    const minutes = workoutMinutes(w);
    await db
      .insert(schema.workouts)
      .values({
        id: w.id,
        title: w.title ?? null,
        startTime: new Date(w.start_time),
        endTime: new Date(w.end_time),
        durationMin: minutes,
        raw: w as unknown as Record<string, unknown>,
        syncedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.workouts.id,
        set: { title: w.title ?? null, startTime: new Date(w.start_time), endTime: new Date(w.end_time), durationMin: minutes, raw: w as unknown as Record<string, unknown>, syncedAt: now },
      });
    report.workoutsUpserted += 1;

    if (minutes >= HEVY.minWorkoutMinutes) {
      report.missionsCompleted += await completeWorkoutMission(w.id, new Date(w.start_time), minutes, tz);
    } else {
      await annotateShortWorkout(new Date(w.start_time), minutes, tz);
    }
  }
  // Move the cursor slightly back to tolerate clock skew; upserts are idempotent.
  await setSetting("hevy_cursor", new Date(now.getTime() - 5 * 60_000).toISOString());

  const measurements = await fetchRecentBodyMeasurements(10);
  for (const m of measurements) {
    if (m.weight_kg == null) continue;
    const dayKey = m.date;
    const existing = await db.query.metricReadings.findFirst({
      where: and(eq(schema.metricReadings.metric, "weight_kg"), eq(schema.metricReadings.dayKey, dayKey), eq(schema.metricReadings.source, "hevy")),
    });
    if (existing) continue;
    await db.insert(schema.metricReadings).values({ metric: "weight_kg", value: String(m.weight_kg), dayKey, source: "hevy" });
    if (m.fat_percent != null) {
      await db.insert(schema.metricReadings).values({ metric: "fat_percent", value: String(m.fat_percent), dayKey, source: "hevy" });
    }
    report.measurementsAdded += 1;
    report.missionsCompleted += await completeWeightMission(dayKey, m.weight_kg);
  }

  return report;
}

/** Complete the hevy_workout mission on the workout's game day (materializing it if needed). */
async function completeWorkoutMission(workoutId: string, startedAt: Date, minutes: number, tz: string): Promise<number> {
  const dayKey = dayKeyFor(startedAt, tz);
  await materializeDay(dayKey);
  const habit = await db.query.habits.findFirst({ where: and(eq(schema.habits.kind, "hevy_workout"), eq(schema.habits.active, true)) });
  if (!habit) return 0;
  const mission = await db.query.missions.findFirst({
    where: and(eq(schema.missions.dayKey, dayKey), eq(schema.missions.habitId, habit.id)),
  });
  if (!mission) return 0;
  if (mission.status === "done") return 0;
  const r = await completeMission(mission.id, { hevyWorkoutId: workoutId, minutes, source: "hevy" }, startedAt);
  return r ? 1 : 0;
}

/** Record a too-short workout on the day's mission so the UI can show "42 min, not counted". */
async function annotateShortWorkout(startedAt: Date, minutes: number, tz: string): Promise<void> {
  const dayKey = dayKeyFor(startedAt, tz);
  const habit = await db.query.habits.findFirst({ where: and(eq(schema.habits.kind, "hevy_workout"), eq(schema.habits.active, true)) });
  if (!habit) return;
  const mission = await db.query.missions.findFirst({ where: and(eq(schema.missions.dayKey, dayKey), eq(schema.missions.habitId, habit.id)) });
  if (!mission || mission.status === "done") return;
  await db.update(schema.missions).set({ meta: { ...mission.meta, shortWorkoutMinutes: minutes } }).where(eq(schema.missions.id, mission.id));
}

/** A weight reading completes the hevy_weight mission for that week, if one is open. */
async function completeWeightMission(dayKey: string, weightKg: number): Promise<number> {
  const habit = await db.query.habits.findFirst({ where: and(eq(schema.habits.kind, "hevy_weight"), eq(schema.habits.active, true)) });
  if (!habit) return 0;
  const start = weekStartKey(dayKey);
  const end = shiftKey(start, 6);
  const mission = await db.query.missions.findFirst({
    where: and(eq(schema.missions.habitId, habit.id), eq(schema.missions.status, "open"), gte(schema.missions.dayKey, start), lte(schema.missions.dayKey, end)),
  });
  if (!mission) return 0;
  const r = await completeMission(mission.id, { weightKg, source: "hevy" });
  return r ? 1 : 0;
}
