import { hevyConfigured } from "@/lib/hevy/client";
import { syncHevy } from "./hevy-sync";
import { getSetting, setSetting } from "./settings";

const THROTTLE_MS = 15 * 60_000;

/** Sync on page load at most every 15 minutes, so the app stays fresh without a frequent cron. */
export async function maybeSyncHevy(now = new Date()): Promise<void> {
  if (!hevyConfigured()) return;
  const last = await getSetting("hevy_last_sync");
  if (last && now.getTime() - new Date(last).getTime() < THROTTLE_MS) return;
  try {
    await syncHevy(now);
    await setSetting("hevy_last_sync", now.toISOString());
  } catch (e) {
    await setSetting("hevy_last_error", e instanceof Error ? e.message : String(e));
  }
}
