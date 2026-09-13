import { LIFE_POWER } from "@/config/game";
import { areaLevel } from "./xp";

export interface LpInput {
  /** XP per enabled area. */
  areaXp: number[];
  /** Whether each enabled area was touched in the balance window (same order as areaXp). */
  areaTouched: boolean[];
  daysClearedThisMonth: number;
  goalsCompleted: number;
}

export interface LpBreakdown {
  base: number;
  attendanceMultiplier: number;
  goalMultiplier: number;
  balanceFactor: number;
  total: number;
}

/**
 * LP = Σ(area_level × 100)
 *      × (1 + 0.02 × days cleared this month, max 28)
 *      × (1 + 0.05 × goals completed)
 *      × balance factor (1 − 0.15 × share of areas untouched this week)
 */
export function lifePower(input: LpInput): LpBreakdown {
  const base = input.areaXp.reduce((sum, xp) => sum + areaLevel(xp) * LIFE_POWER.perAreaLevel, 0);
  const days = Math.min(LIFE_POWER.maxDaysCleared, Math.max(0, input.daysClearedThisMonth));
  const attendanceMultiplier = 1 + LIFE_POWER.perDayClearedThisMonth * days;
  const goalMultiplier = 1 + LIFE_POWER.perGoalCompleted * Math.max(0, input.goalsCompleted);
  const areas = input.areaTouched.length;
  const untouched = input.areaTouched.filter((t) => !t).length;
  const balanceFactor = areas === 0 ? 1 : 1 - LIFE_POWER.balancePenalty * (untouched / areas);
  const total = Math.round(base * attendanceMultiplier * goalMultiplier * balanceFactor);
  return { base, attendanceMultiplier, goalMultiplier, balanceFactor, total };
}
