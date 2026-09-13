export interface RewardProgress {
  /** Progress counted since the reward was created (or absolute for level/boss). */
  value: number;
  target: number;
  fraction: number;
  unlocked: boolean;
}

export function rewardProgress(current: number, baseline: number, target: number, absolute = false): RewardProgress {
  const value = absolute ? current : Math.max(0, current - baseline);
  const t = Math.max(1, target);
  return { value, target: t, fraction: Math.min(1, value / t), unlocked: value >= t };
}
