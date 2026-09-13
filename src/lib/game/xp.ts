import { AREA_LEVEL_BASE, AREA_LEVEL_EXPONENT, CHARACTER_CURVE_SCALE, AVATAR_TIERS } from "@/config/game";

/** Cumulative XP required to reach `level` on the area curve. Level 1 = 0. */
export function xpForAreaLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(AREA_LEVEL_BASE * Math.pow(level, AREA_LEVEL_EXPONENT));
}

export function xpForCharacterLevel(level: number): number {
  return xpForAreaLevel(level) * CHARACTER_CURVE_SCALE;
}

function levelFromXp(xp: number, curve: (level: number) => number): number {
  let level = 1;
  while (curve(level + 1) <= xp) level += 1;
  return level;
}

export function areaLevel(xp: number): number {
  return levelFromXp(Math.max(0, xp), xpForAreaLevel);
}

export function characterLevel(totalXp: number): number {
  return levelFromXp(Math.max(0, totalXp), xpForCharacterLevel);
}

export interface LevelProgress {
  level: number;
  /** XP earned inside the current level. */
  into: number;
  /** XP span of the current level. */
  span: number;
  /** 0..1 */
  fraction: number;
  /** XP still needed to reach the next level. */
  toNext: number;
}

export function progress(xp: number, curve: (level: number) => number, level: number): LevelProgress {
  const floor = curve(level);
  const ceil = curve(level + 1);
  const span = ceil - floor;
  const into = Math.max(0, xp - floor);
  return { level, into, span, fraction: Math.min(1, into / span), toNext: Math.max(0, ceil - xp) };
}

export function areaProgress(xp: number): LevelProgress {
  return progress(xp, xpForAreaLevel, areaLevel(xp));
}

export function characterProgress(totalXp: number): LevelProgress {
  return progress(totalXp, xpForCharacterLevel, characterLevel(totalXp));
}

export function avatarTier(level: number): number {
  let tier = 1;
  AVATAR_TIERS.forEach((min, i) => {
    if (level >= min) tier = i + 1;
  });
  return tier;
}
