import { NextResponse } from "next/server";
import { loadGameState, snapshotDay } from "@/lib/services/game-state";
import { syncHevy } from "@/lib/services/hevy-sync";
import { currentDayKey, materializeDay } from "@/lib/services/missions";
import { setSetting } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

/** Runs after the daily reset: sync Hevy, materialize today's missions, snapshot LP. */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const now = new Date();
  const dayKey = await currentDayKey(now);
  await materializeDay(dayKey);
  let sync: unknown = null;
  try {
    sync = await syncHevy(now);
    await setSetting("hevy_last_sync", now.toISOString());
  } catch (e) {
    sync = { error: e instanceof Error ? e.message : String(e) };
  }
  const state = await loadGameState(dayKey);
  await snapshotDay(dayKey, state);
  return NextResponse.json({ dayKey, lp: state.lp.total, level: state.character.level, sync });
}
