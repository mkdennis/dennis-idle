/**
 * Every tunable number in the game lives here. Change values, not code.
 * See PRD.md §5 "The numbers".
 */
export const EFFORT_XP = { S: 10, M: 25, L: 50 } as const;
export type Effort = keyof typeof EFFORT_XP;

export const EFFORT_COINS = { S: 5, M: 10, L: 20 } as const;

/** Cumulative XP needed to *reach* level n: 100 * n^1.5. Level 1 is 0 XP. */
export const AREA_LEVEL_BASE = 100;
export const AREA_LEVEL_EXPONENT = 1.5;
/** Character level uses the same curve scaled by this factor. */
export const CHARACTER_CURVE_SCALE = 4;

export const DAY_CLEAR = {
  /** Local hour at which a new day starts (late nights count toward the previous day). */
  resetHour: 4,
  /** Minimum done missions before Day Clear can be claimed. */
  minDone: 2,
  /** Every planned mission must be done or skipped, not just minDone. */
  requireAll: true,
  coins: 100,
  xp: 50,
} as const;

export const WEEK = {
  /** 1 = Monday (JS getDay convention, Sunday = 0). */
  resetWeekday: 1,
  /** Bonus paid when a habit hits its weekly target: one extra completion's XP plus these coins. */
  targetBonusCoins: 25,
  /** The 4th gym session (one past target) pays this fraction of the bonus again. */
  overTargetBonusFraction: 0.5,
} as const;

export const LIFE_POWER = {
  perAreaLevel: 100,
  perDayClearedThisMonth: 0.02,
  maxDaysCleared: 28,
  perGoalCompleted: 0.05,
  /** LP is reduced by up to this fraction when enabled areas go untouched for a week. */
  balancePenalty: 0.15,
  balanceWindowDays: 7,
} as const;

export const HEVY = {
  /** A workout must be at least this long to count as a gym session. */
  minWorkoutMinutes: 60,
  /** How far back the first sync looks. */
  initialLookbackDays: 30,
} as const;

/** Avatar tier bands by character level. */
export const AVATAR_TIERS = [1, 5, 10, 20, 35, 50] as const;
