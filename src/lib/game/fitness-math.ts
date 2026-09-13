import { dayKeyFor, shiftKey, weekStartKey, type DayKey } from "./time";

export interface HevySet { type?: string; reps?: number | null; weight_kg?: number | null }
export interface HevyExercise { title?: string; exercise_template_id?: string; sets?: HevySet[] }

/** Epley estimated one-rep max. Reps of 1 return the weight itself. */
export function epley1rm(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export interface ExerciseBest {
  templateId: string;
  title: string;
  bestE1rmKg: number;
  bestWeightKg: number;
  bestReps: number;
  sessions: number;
  lastDayKey: DayKey;
}

/** Best estimated 1RM per exercise across workouts, ignoring warmup sets. */
export function bestPerExercise(
  workouts: Array<{ startTime: Date; raw: { exercises?: HevyExercise[] } }>,
  tz: string,
): ExerciseBest[] {
  const map = new Map<string, ExerciseBest>();
  for (const w of workouts) {
    const dayKey = dayKeyFor(w.startTime, tz);
    const seen = new Set<string>();
    for (const ex of w.raw.exercises ?? []) {
      const id = ex.exercise_template_id ?? ex.title ?? "?";
      const title = ex.title ?? id;
      let cur = map.get(id);
      if (!cur) {
        cur = { templateId: id, title, bestE1rmKg: 0, bestWeightKg: 0, bestReps: 0, sessions: 0, lastDayKey: dayKey };
        map.set(id, cur);
      }
      if (!seen.has(id)) {
        cur.sessions += 1;
        seen.add(id);
        if (dayKey > cur.lastDayKey) cur.lastDayKey = dayKey;
      }
      for (const s of ex.sets ?? []) {
        if (s.type === "warmup") continue;
        const w = s.weight_kg ?? 0;
        const r = s.reps ?? 0;
        const e = epley1rm(w, r);
        if (e > cur.bestE1rmKg) {
          cur.bestE1rmKg = e;
          cur.bestWeightKg = w;
          cur.bestReps = r;
        }
      }
    }
  }
  return [...map.values()].sort((a, b) => b.sessions - a.sessions || b.bestE1rmKg - a.bestE1rmKg);
}

export interface WeekBucket { weekStart: DayKey; sessions: number; countedSessions: number; minutes: number; isCurrent: boolean }

/** Sessions and minutes per week for the `weeks` most recent weeks, oldest first. */
export function weeklyBuckets(
  workouts: Array<{ startTime: Date; durationMin: number }>,
  todayKey: DayKey,
  tz: string,
  weeks = 8,
  minCountedMinutes = 60,
): WeekBucket[] {
  const current = weekStartKey(todayKey);
  const buckets: WeekBucket[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = shiftKey(current, -7 * i);
    buckets.push({ weekStart: ws, sessions: 0, countedSessions: 0, minutes: 0, isCurrent: ws === current });
  }
  const byStart = new Map(buckets.map((b) => [b.weekStart, b]));
  for (const w of workouts) {
    const b = byStart.get(weekStartKey(dayKeyFor(w.startTime, tz)));
    if (!b) continue;
    b.sessions += 1;
    b.minutes += w.durationMin;
    if (w.durationMin >= minCountedMinutes) b.countedSessions += 1;
  }
  return buckets;
}

export function kgToLb(kg: number): number {
  return kg * 2.20462;
}
