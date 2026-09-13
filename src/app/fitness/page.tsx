import { TabBar } from "@/components/tab-bar";
import { BossGolem, HeroLifter } from "@/components/art";
import { Chevrons } from "@/components/icons";
import { BossPicker } from "@/components/boss-picker";
import { HEVY } from "@/config/game";
import { kgToLb } from "@/lib/game/fitness-math";
import { loadGameState } from "@/lib/services/game-state";
import { loadFitness } from "@/lib/services/fitness";
import { currentDayKey } from "@/lib/services/missions";
import { maybeSyncHevy } from "@/lib/services/hevy-auto";

export const dynamic = "force-dynamic";

const GYM_TARGET = 3;

export default async function FitnessPage() {
  const now = new Date();
  const dayKey = await currentDayKey(now);
  await maybeSyncHevy(now);
  const [state, fit] = await Promise.all([loadGameState(dayKey), loadFitness(dayKey)]);
  const thisWeek = fit.weeks[fit.weeks.length - 1];
  const lastWeek = fit.weeks[fit.weeks.length - 2];
  const health = state.areas.find((a) => a.id === "health");
  const maxMinutes = Math.max(60, ...fit.weeks.map((w) => w.minutes));

  return (
    <main className="pb-28">
      {/* Hero banner in the Hero Power card style */}
      <div className="panel mx-3.5 mt-3.5">
        <div className="relative flex items-center overflow-hidden px-4 pt-3 pb-4" style={{ background: "var(--sky-grad)" }}>
          <svg viewBox="0 0 390 140" className="absolute inset-0 h-full w-full" fill="#fff" aria-hidden>
            <path d="M30 20 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" opacity=".9" />
            <path d="M330 18 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" opacity=".8" />
            <circle cx="70" cy="90" r="2" opacity=".7" /><circle cx="300" cy="70" r="1.5" opacity=".7" />
          </svg>
          <div className="relative flex grow flex-col gap-1.5">
            <div className="text-[26px] font-black leading-none text-white" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.18)" }}>Fitness</div>
            <div className="text-[11px] font-bold text-white/95">Train {GYM_TARGET}× a week, {HEVY.minWorkoutMinutes}+ minutes each. Hevy keeps score.</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="text-[11px] font-black text-[#d6e83a]">Health Lv {health?.progress.level ?? 1}</div>
              <div className="bar h-2.5 w-36" style={{ background: "rgba(0,0,0,0.45)" }}>
                <div className="bar-fill" style={{ width: `${Math.round((health?.progress.fraction ?? 0) * 100)}%` }} />
              </div>
            </div>
          </div>
          <div className="relative -mr-2 shrink-0"><HeroLifter size={116} /></div>
        </div>
        <div className="panel-body grid grid-cols-2 gap-2 p-2.5">
          <StatCard label="Sessions this week" before={lastWeek ? `${lastWeek.countedSessions}` : undefined} after={`${thisWeek.countedSessions}`} suffix={`/ ${GYM_TARGET}`} fraction={Math.min(1, thisWeek.countedSessions / GYM_TARGET)} pill={`${thisWeek.countedSessions}/${GYM_TARGET}`} />
          <StatCard label="Minutes this week" before={lastWeek ? `${lastWeek.minutes}` : undefined} after={`${thisWeek.minutes}`} suffix="min" fraction={Math.min(1, thisWeek.minutes / (GYM_TARGET * HEVY.minWorkoutMinutes))} pill={`${thisWeek.minutes} / ${GYM_TARGET * HEVY.minWorkoutMinutes}`} />
        </div>
      </div>

      {/* Training boss */}
      <div className="panel mx-3.5 mt-3">
        <div className="panel-head" style={{ background: "#3a1f4d" }}>
          <span>Training Boss</span>
          <span className="font-mono text-[11px] text-[#d8b4fe]">est. 1RM</span>
        </div>
        <div className="flex flex-col gap-2.5 p-2.5" style={{ background: "linear-gradient(180deg, #4a1f2a 0%, #2b1a33 100%)" }}>
          {fit.boss ? (
            <div className="flex items-center gap-3">
              <div className="shrink-0"><BossGolem size={92} /></div>
              <div className="flex grow flex-col gap-1.5">
                <div className="text-[14px] font-black text-white">{fit.boss.title}</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[20px] font-extrabold text-white">{Math.round(kgToLb(fit.boss.bestKg))}</span>
                  <Chevrons className="text-[#d8b4fe]" size={12} />
                  <span className="font-mono text-[20px] font-extrabold text-[#38d3e6]">{Math.round(kgToLb(fit.boss.targetKg))}</span>
                  <span className="text-[10px] font-extrabold text-[#d8b4fe]">lb</span>
                </div>
                <div className="bar h-3" style={{ background: "#1a1a1c" }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.round(fit.boss.progress * 100)}%`, background: "linear-gradient(180deg, #ff7a8a, #e8445a)" }} />
                  <div className="bar-label"><span className="bar-pill">HP {Math.max(0, Math.round(kgToLb(fit.boss.targetKg - fit.boss.bestKg)))} lb left</span></div>
                </div>
                <div className="text-[10px] font-bold text-[#d8b4fe]">Best set {Math.round(kgToLb(fit.boss.bestWeightKg))} lb × {fit.boss.bestReps}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="shrink-0"><BossGolem size={80} /></div>
              <div className="text-[12px] font-bold text-[#e9d5ff]">Pick a lift and a target. Your best estimated one-rep max from Hevy chips away at the boss.</div>
            </div>
          )}
          <BossPicker exercises={fit.exercises.map((e) => ({ id: e.templateId, title: e.title, bestLb: Math.round(kgToLb(e.bestE1rmKg)), sessions: e.sessions }))} current={fit.boss ? { id: fit.boss.templateId, targetLb: Math.round(kgToLb(fit.boss.targetKg)) } : null} />
        </div>
      </div>

      {/* Weekly volume */}
      <div className="panel mx-3.5 mt-3">
        <div className="panel-head"><span>Last 8 Weeks</span><span className="font-mono text-[11px] text-muted">minutes · sessions</span></div>
        <div className="panel-body p-2.5">
          <div className="card px-3 pt-3 pb-2">
            <div className="flex h-24 items-end gap-1.5">
              {fit.weeks.map((w) => (
                <div key={w.weekStart} className="flex grow flex-col items-center gap-1">
                  <div className="font-mono text-[9px] font-extrabold text-ink-2">{w.minutes || ""}</div>
                  <div className="w-full rounded-t-[4px]" style={{ height: `${Math.max(3, Math.round((w.minutes / maxMinutes) * 64))}px`, background: w.isCurrent ? "var(--cyan)" : "var(--gold-grad)" }} />
                  <div className={`font-mono text-[9px] font-extrabold ${w.isCurrent ? "text-cyan-2" : "text-ink-2"}`}>{w.countedSessions}</div>
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[9px] font-extrabold text-ink-2"><span>{fit.weeks[0].weekStart.slice(5)}</span><span>this week</span></div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="panel mx-3.5 mt-3">
        <div className="panel-head"><span>Hevy History</span><span className="font-mono text-[11px] text-muted">{fit.workouts.length} synced</span></div>
        <div className="panel-body">
          {fit.workouts.slice(0, 10).map((w) => {
            const counted = w.durationMin >= HEVY.minWorkoutMinutes;
            const exercises = ((w.raw as { exercises?: { title?: string }[] }).exercises ?? []).length;
            return (
              <div key={w.id} className={`card flex items-center gap-2.5 px-2.5 py-2 ${counted ? "" : "card-done"}`}>
                <div className="flex grow flex-col gap-px">
                  <div className={`text-[13px] font-extrabold ${counted ? "text-ink" : "text-ink-2"}`}>{w.title ?? "Workout"}</div>
                  <div className="text-[11px] font-bold text-ink-2">{w.startTime.toLocaleDateString("en-US", { timeZone: fit.tz, weekday: "short", month: "short", day: "numeric" })} · {exercises} exercises</div>
                </div>
                <span className="font-mono text-xs font-extrabold text-ink">{w.durationMin} min</span>
                <span className={`btn px-2.5 text-[11px] ${counted ? "btn-lime" : "btn-gray"}`}>{counted ? "Counted" : "Short"}</span>
              </div>
            );
          })}
          {fit.workouts.length === 0 && <div className="px-2 py-3 text-center text-xs font-bold text-ink-2">No workouts synced yet. Finish one in Hevy and open this tab.</div>}
        </div>
      </div>

      <TabBar active="/fitness" exp={state.character} />
    </main>
  );
}

function StatCard({ label, before, after, suffix, fraction, pill }: { label: string; before?: string; after: string; suffix: string; fraction: number; pill: string }) {
  return (
    <div className="card flex flex-col gap-1.5 px-3 py-2.5">
      <div className="text-[12px] font-black text-ink">{label}</div>
      <div className="flex items-baseline gap-1.5">
        {before != null && before !== after && (<><span className="font-mono text-[15px] font-extrabold text-ink-2">{before}</span><Chevrons className="text-[#9a9ba1]" size={11} /></>)}
        <span className="font-mono text-[22px] font-extrabold leading-none text-cyan-2">{after}</span>
        <span className="text-[10px] font-extrabold text-ink-2">{suffix}</span>
      </div>
      <div className="bar h-2.5"><div className="bar-fill" style={{ width: `${Math.round(fraction * 100)}%` }} /><div className="absolute inset-0 flex items-center justify-end pr-1.5 font-mono text-[8px] font-extrabold text-white">{pill}</div></div>
    </div>
  );
}
