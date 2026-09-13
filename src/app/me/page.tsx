import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { TabBar } from "@/components/tab-bar";
import { SyncButton } from "@/components/sync-button";
import { logoutAction, saveTimezoneAction } from "@/app/actions";
import { LIFE_POWER, DAY_CLEAR, HEVY } from "@/config/game";
import { hevyConfigured } from "@/lib/hevy/client";
import { loadGameState } from "@/lib/services/game-state";
import { currentDayKey } from "@/lib/services/missions";
import { getSetting, getTimeZone } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const dayKey = await currentDayKey();
  const [state, tz, lastSync, lastError, workouts, weights] = await Promise.all([
    loadGameState(dayKey),
    getTimeZone(),
    getSetting("hevy_last_sync"),
    getSetting("hevy_last_error"),
    db.query.workouts.findMany({ orderBy: desc(schema.workouts.startTime), limit: 5 }),
    db.query.metricReadings.findMany({ where: (r, { eq }) => eq(r.metric, "weight_kg"), orderBy: desc(schema.metricReadings.dayKey), limit: 3 }),
  ]);

  return (
    <main className="pb-28">
      <div className="panel mx-3.5 mt-3.5">
        <div className="panel-head h-11"><span className="text-[15px]">Hevy</span><span className="font-mono text-[11px] text-muted">{hevyConfigured() ? "connected" : "no API key"}</span></div>
        <div className="panel-body gap-2 p-2.5">
          <div className="card flex items-center gap-2.5 px-2.5 py-2">
            <div className="grow">
              <div className="text-[13px] font-extrabold text-ink">Sync workouts and weight</div>
              <div className="text-[11px] font-bold text-ink-2">
                {lastSync ? `Last sync ${new Date(lastSync).toLocaleString("en-US", { timeZone: tz, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : "Never synced"}
                {lastError ? ` · last error: ${lastError}` : ""}
              </div>
            </div>
            <SyncButton disabled={!hevyConfigured()} />
          </div>
          {workouts.map((w) => (
            <div key={w.id} className="card flex items-center gap-2.5 px-2.5 py-2">
              <div className="grow">
                <div className="text-[13px] font-extrabold text-ink">{w.title ?? "Workout"}</div>
                <div className="text-[11px] font-bold text-ink-2">{w.startTime.toLocaleDateString("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric" })}</div>
              </div>
              <span className={`font-mono text-xs font-extrabold ${w.durationMin >= HEVY.minWorkoutMinutes ? "text-cyan-2" : "text-ink-2"}`}>{w.durationMin} min</span>
            </div>
          ))}
          {weights.length > 0 && (
            <div className="card px-2.5 py-2 text-[11px] font-bold text-ink-2">
              Weight: {weights.map((w) => `${(Number(w.value) * 2.20462).toFixed(1)} lb (${w.dayKey})`).join(" · ")}
            </div>
          )}
        </div>
      </div>

      <div className="panel mx-3.5 mt-3">
        <div className="panel-head h-9">How Life Power works</div>
        <div className="panel-body p-2.5">
          <div className="card px-3 py-2.5 text-[12px] font-bold leading-relaxed text-ink-2">
            <div><span className="text-ink">Base</span> = sum of area levels × {LIFE_POWER.perAreaLevel} = <span className="font-mono text-ink">{state.lp.base}</span></div>
            <div><span className="text-ink">Attendance</span> = 1 + {LIFE_POWER.perDayClearedThisMonth} × days cleared this month = <span className="font-mono text-ink">×{state.lp.attendanceMultiplier.toFixed(2)}</span></div>
            <div><span className="text-ink">Balance</span> = 1 − {LIFE_POWER.balancePenalty} × share of areas untouched in 7 days = <span className="font-mono text-ink">×{state.lp.balanceFactor.toFixed(2)}</span></div>
            <div className="mt-1 text-ink">Life Power = <span className="font-mono text-cyan-2">{state.lp.total.toLocaleString()}</span></div>
            <div className="mt-2">Day Clear needs at least {DAY_CLEAR.minDone} done and nothing left open. It pays {DAY_CLEAR.coins} coins and {DAY_CLEAR.xp} XP to your lowest touched area.</div>
          </div>
        </div>
      </div>

      <div className="panel mx-3.5 mt-3">
        <div className="panel-head h-9">Settings</div>
        <div className="panel-body gap-2 p-2.5">
          <form action={saveTimezoneAction} className="card flex items-center gap-2 px-2.5 py-2">
            <label className="grow text-[13px] font-extrabold text-ink">Timezone<div className="text-[11px] font-bold text-ink-2">Daily reset at {DAY_CLEAR.resetHour}:00 local</div></label>
            <input name="timezone" defaultValue={tz} className="h-9 w-40 rounded-md bg-section px-2 font-mono text-[11px] font-extrabold text-ink outline-none focus:ring-2 focus:ring-cyan" />
            <button className="btn btn-cyan">Save</button>
          </form>
          <form action={logoutAction} className="card flex items-center justify-between px-2.5 py-2">
            <span className="text-[13px] font-extrabold text-ink">Signed in</span>
            <button className="btn btn-gray">Log out</button>
          </form>
        </div>
      </div>

      <TabBar active="/me" exp={state.character} />
    </main>
  );
}
