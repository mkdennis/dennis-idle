import { and, eq, gte, lte } from "drizzle-orm";
import { db, schema } from "@/db";
import { shiftKey, type DayKey } from "@/lib/game/time";
import { completeMission } from "./missions";
import { getSetting, setSetting } from "./settings";

export interface DietTargets { calories: number; protein: number }

export const DEFAULT_TARGETS: DietTargets = { calories: 2200, protein: 160 };

export async function getDietTargets(): Promise<DietTargets> {
  const c = Number((await getSetting("diet_calories_target")) ?? DEFAULT_TARGETS.calories);
  const p = Number((await getSetting("diet_protein_target")) ?? DEFAULT_TARGETS.protein);
  return { calories: c > 0 ? c : DEFAULT_TARGETS.calories, protein: p > 0 ? p : DEFAULT_TARGETS.protein };
}

export async function saveDietTargets(t: DietTargets): Promise<void> {
  await setSetting("diet_calories_target", String(Math.round(t.calories)));
  await setSetting("diet_protein_target", String(Math.round(t.protein)));
}

export interface DietEntry { calories: number; protein: number; carbs?: number | null; fat?: number | null; note?: string | null }

/** Upsert the day's numbers and complete the day's food-log mission if it is open. */
export async function saveDietDay(dayKey: DayKey, e: DietEntry): Promise<{ missionXp: number | null }> {
  await db
    .insert(schema.dietDays)
    .values({ dayKey, calories: e.calories, protein: e.protein, carbs: e.carbs ?? null, fat: e.fat ?? null, note: e.note ?? null, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.dietDays.dayKey,
      set: { calories: e.calories, protein: e.protein, carbs: e.carbs ?? null, fat: e.fat ?? null, note: e.note ?? null, updatedAt: new Date() },
    });

  const habit = await db.query.habits.findFirst({ where: and(eq(schema.habits.kind, "diet_log"), eq(schema.habits.active, true)) });
  if (!habit) return { missionXp: null };
  const mission = await db.query.missions.findFirst({ where: and(eq(schema.missions.dayKey, dayKey), eq(schema.missions.habitId, habit.id)) });
  if (!mission || mission.status === "done") return { missionXp: null };
  const r = await completeMission(mission.id, { calories: e.calories, protein: e.protein });
  return { missionXp: r?.xp ?? null };
}

export async function loadDietWeek(todayKey: DayKey): Promise<Array<typeof schema.dietDays.$inferSelect>> {
  const start = shiftKey(todayKey, -6);
  return db.query.dietDays.findMany({ where: and(gte(schema.dietDays.dayKey, start), lte(schema.dietDays.dayKey, todayKey)) });
}
