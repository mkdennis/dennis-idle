import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { HEVY } from "@/config/game";
import { bestPerExercise, weeklyBuckets, type ExerciseBest, type WeekBucket } from "@/lib/game/fitness-math";
import { type DayKey } from "@/lib/game/time";
import { getSetting, getTimeZone, setSetting } from "./settings";

export interface BossGoal {
  templateId: string;
  title: string;
  targetKg: number;
  bestKg: number;
  bestWeightKg: number;
  bestReps: number;
  /** 0..1 share of the target already reached. */
  progress: number;
}

export interface FitnessView {
  workouts: Array<typeof schema.workouts.$inferSelect>;
  exercises: ExerciseBest[];
  weeks: WeekBucket[];
  boss: BossGoal | null;
  tz: string;
}

export async function loadFitness(todayKey: DayKey): Promise<FitnessView> {
  const tz = await getTimeZone();
  const workouts = await db.query.workouts.findMany({ orderBy: desc(schema.workouts.startTime), limit: 200 });
  const exercises = bestPerExercise(workouts.map((w) => ({ startTime: w.startTime, raw: w.raw as { exercises?: never[] } })), tz);
  const weeks = weeklyBuckets(workouts, todayKey, tz, 8, HEVY.minWorkoutMinutes);

  const bossId = await getSetting("boss_exercise_id");
  const bossTarget = Number((await getSetting("boss_target_kg")) ?? 0);
  const ex = bossId ? exercises.find((e) => e.templateId === bossId) : undefined;
  const boss: BossGoal | null =
    ex && bossTarget > 0
      ? {
          templateId: ex.templateId,
          title: ex.title,
          targetKg: bossTarget,
          bestKg: ex.bestE1rmKg,
          bestWeightKg: ex.bestWeightKg,
          bestReps: ex.bestReps,
          progress: Math.min(1, ex.bestE1rmKg / bossTarget),
        }
      : null;

  return { workouts, exercises, weeks, boss, tz };
}

export async function saveBoss(templateId: string, targetKg: number): Promise<void> {
  await setSetting("boss_exercise_id", templateId);
  await setSetting("boss_target_kg", String(targetKg));
}
