import { asc, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { HEVY } from "@/config/game";
import { areaLevel } from "@/lib/game/xp";
import { rewardProgress, type RewardProgress } from "@/lib/game/rewards-math";
import type { RewardCondition } from "@/db/schema";
import { getDietTargets } from "./diet";
import { loadFitness } from "./fitness";
import type { DayKey } from "@/lib/game/time";

export const CONDITIONS: Array<{ id: RewardCondition; label: string; unit: string; absolute: boolean; needsArea?: boolean }> = [
  { id: "gym_sessions", label: "Gym sessions counted", unit: "sessions", absolute: false },
  { id: "days_cleared", label: "Days cleared", unit: "days", absolute: false },
  { id: "food_logged_days", label: "Days of food logged", unit: "days", absolute: false },
  { id: "protein_hits", label: "Days protein target hit", unit: "days", absolute: false },
  { id: "area_level", label: "Reach an area level", unit: "level", absolute: true, needsArea: true },
  { id: "boss_defeated", label: "Defeat the training boss", unit: "", absolute: true },
  { id: "coins", label: "Coins earned", unit: "coins", absolute: false },
];

async function currentValue(condition: RewardCondition, param: string | null, todayKey: DayKey): Promise<number> {
  switch (condition) {
    case "area_level": {
      const a = param ? await db.query.areas.findFirst({ where: eq(schema.areas.id, param) }) : null;
      return a ? areaLevel(a.xp) : 0;
    }
    case "days_cleared": {
      const r = await db.select({ n: sql<number>`count(*)::int` }).from(schema.days).where(sql`${schema.days.clearedAt} is not null`);
      return r[0]?.n ?? 0;
    }
    case "gym_sessions": {
      const r = await db.select({ n: sql<number>`count(*)::int` }).from(schema.workouts).where(gte(schema.workouts.durationMin, HEVY.minWorkoutMinutes));
      return r[0]?.n ?? 0;
    }
    case "food_logged_days": {
      const r = await db.select({ n: sql<number>`count(*)::int` }).from(schema.dietDays);
      return r[0]?.n ?? 0;
    }
    case "protein_hits": {
      const t = await getDietTargets();
      const r = await db.select({ n: sql<number>`count(*)::int` }).from(schema.dietDays).where(gte(schema.dietDays.protein, t.protein));
      return r[0]?.n ?? 0;
    }
    case "boss_defeated": {
      const f = await loadFitness(todayKey);
      return f.boss && f.boss.progress >= 1 ? 1 : 0;
    }
    case "coins": {
      const r = await db.select({ n: sql<number>`coalesce(sum(${schema.coinEvents.amount}), 0)::int` }).from(schema.coinEvents);
      return r[0]?.n ?? 0;
    }
  }
}

export interface RewardView {
  id: number;
  title: string;
  condition: RewardCondition;
  conditionLabel: string;
  unit: string;
  param: string | null;
  progress: RewardProgress;
  claimedAt: Date | null;
}

export async function loadRewards(todayKey: DayKey): Promise<RewardView[]> {
  const rows = await db.query.rewards.findMany({ orderBy: asc(schema.rewards.createdAt) });
  const out: RewardView[] = [];
  for (const r of rows) {
    const c = CONDITIONS.find((x) => x.id === r.condition)!;
    const cur = await currentValue(r.condition, r.param, todayKey);
    out.push({
      id: r.id,
      title: r.title,
      condition: r.condition,
      conditionLabel: c.label,
      unit: c.unit,
      param: r.param,
      progress: rewardProgress(cur, r.baseline, r.target, c.absolute),
      claimedAt: r.claimedAt,
    });
  }
  // Unlocked and unclaimed first, then in progress, then claimed.
  return out.sort((a, b) => rank(a) - rank(b));
}

function rank(r: RewardView) {
  if (r.claimedAt) return 2;
  return r.progress.unlocked ? 0 : 1;
}

export async function createReward(title: string, condition: RewardCondition, param: string | null, target: number, todayKey: DayKey): Promise<void> {
  const c = CONDITIONS.find((x) => x.id === condition);
  if (!c) throw new Error("unknown condition");
  const baseline = c.absolute ? 0 : await currentValue(condition, param, todayKey);
  await db.insert(schema.rewards).values({ title, condition, param, target, baseline });
}

export async function claimReward(id: number, todayKey: DayKey): Promise<boolean> {
  const r = await db.query.rewards.findFirst({ where: eq(schema.rewards.id, id) });
  if (!r || r.claimedAt) return false;
  const c = CONDITIONS.find((x) => x.id === r.condition)!;
  const cur = await currentValue(r.condition, r.param, todayKey);
  if (!rewardProgress(cur, r.baseline, r.target, c.absolute).unlocked) return false;
  await db.update(schema.rewards).set({ claimedAt: new Date() }).where(eq(schema.rewards.id, id));
  return true;
}

export async function deleteReward(id: number): Promise<void> {
  await db.delete(schema.rewards).where(eq(schema.rewards.id, id));
}
