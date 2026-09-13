import { and, eq, gte, lte } from "drizzle-orm";
import { db, schema } from "@/db";
import { TabBar } from "@/components/tab-bar";
import { Check, Clock } from "@/components/icons";
import { dayClearState } from "@/lib/game/day-clear";
import { shiftKey, weekStartKey } from "@/lib/game/time";
import { loadGameState } from "@/lib/services/game-state";
import { currentDayKey } from "@/lib/services/missions";

export const dynamic = "force-dynamic";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export default async function WeekPage() {
  const today = await currentDayKey();
  const start = weekStartKey(today);
  const end = shiftKey(start, 6);
  const keys = Array.from({ length: 7 }, (_, i) => shiftKey(start, i));

  const [state, days, missions, habits] = await Promise.all([
    loadGameState(today),
    db.query.days.findMany({ where: and(gte(schema.days.dayKey, start), lte(schema.days.dayKey, end)) }),
    db.query.missions.findMany({ where: and(gte(schema.missions.dayKey, start), lte(schema.missions.dayKey, end)) }),
    db.query.habits.findMany({ where: eq(schema.habits.active, true) }),
  ]);
  const dayByKey = new Map(days.map((d) => [d.dayKey, d]));

  const tiles = keys.map((k, i) => {
    const ms = missions.filter((m) => m.dayKey === k);
    const dc = dayClearState(ms, dayByKey.get(k)?.clearedAt ?? null);
    return { key: k, letter: DAY_LETTERS[i], isToday: k === today, future: k > today, cleared: dc.claimed, done: dc.done, total: dc.total };
  });

  const weekly = habits
    .filter((h) => h.weeklyTarget)
    .map((h) => ({
      id: h.id,
      title: h.title,
      target: h.weeklyTarget!,
      done: missions.filter((m) => m.habitId === h.id && m.status === "done").length,
      xp: h.effort === "S" ? 10 : h.effort === "M" ? 25 : 50,
    }));

  const cleared = tiles.filter((t) => t.cleared).length;

  return (
    <main className="pb-28">
      <div className="panel mx-3.5 mt-3.5">
        <div className="panel-head h-11">
          <span className="text-[15px]">This Week</span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted"><Clock /> Resets Mon 4:00</span>
        </div>
        <div className="panel-body gap-2.5 p-2.5">
          <div className="grid grid-cols-7 gap-1.5">
            {tiles.map((t) => (
              <div key={t.key} className="flex flex-col items-center gap-1">
                <div className={`text-[10px] font-extrabold ${t.isToday ? "text-cyan-2" : "text-[#8a8b90]"}`}>{t.letter}</div>
                <div
                  className={`flex h-[34px] w-full items-center justify-center rounded-[7px] font-mono text-[10px] font-extrabold ${
                    t.cleared ? "bg-lime text-white" : t.isToday ? "border-2 border-cyan bg-card text-ink" : "bg-card text-ink-2"
                  }`}
                >
                  {t.cleared ? <Check className="text-white" /> : t.future ? "" : t.total ? `${t.done}/${t.total}` : "–"}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center text-[11px] font-extrabold text-ink-2">{cleared} of 7 days cleared</div>
        </div>
      </div>

      <div className="panel mx-3.5 mt-3">
        <div className="panel-head h-9">Habit Targets</div>
        <div className="panel-body">
          {weekly.map((h) => {
            const pct = Math.min(100, Math.round((h.done / h.target) * 100));
            const hit = h.done >= h.target;
            return (
              <div key={h.id} className="card flex min-h-[42px] items-center gap-2.5 px-2.5 py-2">
                <div className="grow text-[13px] font-extrabold text-ink">{h.title}</div>
                <div className="bar h-2.5 w-[120px]">
                  <div className="bar-fill" style={{ width: `${pct}%` }} />
                  <div className="absolute inset-0 flex items-center justify-end pr-1.5 font-mono text-[9px] font-extrabold text-white">{h.done}/{h.target}</div>
                </div>
                <span className={`btn px-2.5 text-[11px] ${hit ? "btn-lime" : "btn-gray"}`}>{hit ? "Hit" : `+${h.xp}`}</span>
              </div>
            );
          })}
          {weekly.length === 0 && <div className="px-2 py-3 text-center text-xs font-bold text-ink-2">No weekly habits yet.</div>}
        </div>
      </div>

      <TabBar active="/week" exp={state.character} />
    </main>
  );
}
