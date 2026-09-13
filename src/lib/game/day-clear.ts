import { DAY_CLEAR } from "@/config/game";

export interface DayClearState {
  total: number;
  done: number;
  skipped: number;
  claimable: boolean;
  claimed: boolean;
  /** Missions still to settle before the capstone unlocks. */
  remaining: number;
}

export function dayClearState(missions: { status: string }[], clearedAt: Date | null): DayClearState {
  const total = missions.length;
  const done = missions.filter((m) => m.status === "done").length;
  const skipped = missions.filter((m) => m.status === "skipped").length;
  const open = total - done - skipped;
  const enough = done >= DAY_CLEAR.minDone;
  const allSettled = !DAY_CLEAR.requireAll || open === 0;
  const claimable = enough && allSettled && clearedAt == null && total > 0;
  const remaining = Math.max(DAY_CLEAR.minDone - done, DAY_CLEAR.requireAll ? open : 0);
  return { total, done, skipped, claimable, claimed: clearedAt != null, remaining };
}
