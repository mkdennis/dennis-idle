import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { TabBar } from "@/components/tab-bar";
import { ChefSlime } from "@/components/art";
import { Check } from "@/components/icons";
import { DietForm } from "@/components/diet-form";
import { saveDietTargetsAction } from "@/app/actions";
import { shiftKey, weekdayOfKey } from "@/lib/game/time";
import { getDietTargets, loadDietWeek } from "@/lib/services/diet";
import { loadGameState } from "@/lib/services/game-state";
import { currentDayKey } from "@/lib/services/missions";

export const dynamic = "force-dynamic";

const LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export default async function DietPage() {
  const dayKey = await currentDayKey();
  const [state, targets, week, today] = await Promise.all([
    loadGameState(dayKey),
    getDietTargets(),
    loadDietWeek(dayKey),
    db.query.dietDays.findFirst({ where: eq(schema.dietDays.dayKey, dayKey) }),
  ]);
  const byKey = new Map(week.map((d) => [d.dayKey, d]));
  const strip = Array.from({ length: 7 }, (_, i) => shiftKey(dayKey, i - 6)).map((k) => ({ key: k, letter: LETTERS[weekdayOfKey(k)], entry: byKey.get(k), isToday: k === dayKey }));
  const logged = strip.filter((s) => s.entry).length;
  const proteinHits = strip.filter((s) => s.entry && s.entry.protein >= targets.protein).length;
  const calPct = today ? Math.min(100, Math.round((today.calories / targets.calories) * 100)) : 0;
  const proPct = today ? Math.min(100, Math.round((today.protein / targets.protein) * 100)) : 0;

  return (
    <main className="pb-28">
      {/* Warm event-panel treatment */}
      <div className="mx-3.5 mt-3.5 overflow-hidden rounded-xl border-2 border-[#e0a24a]" style={{ boxShadow: "0 2px 0 rgba(0,0,0,0.3)" }}>
        <div className="relative flex items-center gap-2 px-4 pt-3 pb-3" style={{ background: "linear-gradient(180deg, #c97a2b 0%, #8a4d16 100%)" }}>
          <div className="relative flex grow flex-col gap-1.5">
            <div className="text-[26px] font-black leading-none text-white" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.25)" }}>Diet</div>
            <div className="text-[11px] font-bold text-[#ffe6c2]">Log the day once. Hit protein, stay near calories.</div>
            <div className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#5a2d0c] px-2.5 py-1 font-mono text-[11px] font-extrabold text-[#ffd27a]">
              {logged}/7 days logged · {proteinHits} protein hits
            </div>
          </div>
          <div className="relative -mr-2 shrink-0"><ChefSlime size={108} /></div>
        </div>

        <div className="flex flex-col gap-2.5 p-2.5" style={{ background: "#d9b98a" }}>
          <div className="rounded-[9px] border border-[#b5843c] bg-[#fff4e0] px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-black text-[#4a2f14]">Today</div>
              <div className="font-mono text-[11px] font-extrabold text-[#8a5a24]">{today ? "logged" : "not logged"}</div>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              <Meter label="Calories" value={today?.calories ?? 0} target={targets.calories} unit="kcal" pct={calPct} fill="var(--gold-grad)" />
              <Meter label="Protein" value={today?.protein ?? 0} target={targets.protein} unit="g" pct={proPct} fill="linear-gradient(180deg, #7ad14a, #3fbf63)" />
            </div>
          </div>

          <DietForm today={today ? { calories: today.calories, protein: today.protein, carbs: today.carbs, fat: today.fat, note: today.note } : null} />

          {/* 7-day timeline, like the event reward track */}
          <div className="rounded-[9px] border border-[#8a5a24] bg-[#4a2f14] px-2.5 pt-2.5 pb-2">
            <div className="grid grid-cols-7 gap-1.5">
              {strip.map((s) => {
                const hit = s.entry && s.entry.protein >= targets.protein;
                return (
                  <div key={s.key} className="flex flex-col items-center gap-1">
                    <div className={`text-[10px] font-extrabold ${s.isToday ? "text-[#ffd27a]" : "text-[#d9b98a]"}`}>{s.letter}</div>
                    <div className={`flex h-10 w-full flex-col items-center justify-center rounded-md border-2 ${s.entry ? "border-[#f2b90c] bg-[#5a3d22]" : "border-[#6b4a2a] bg-[#3a2412]"}`}>
                      {s.entry ? (
                        <>
                          <span className="font-mono text-[9px] font-extrabold text-[#ffd27a]">{Math.round(s.entry.calories / 100) / 10}k</span>
                          {hit ? <Check size={10} className="text-lime" /> : <span className="font-mono text-[8px] text-[#d9b98a]">{s.entry.protein}g</span>}
                        </>
                      ) : (
                        <span className="text-[10px] text-[#6b4a2a]">–</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[#2b1a0c]"><div className="h-full rounded-full bg-[#f2b90c]" style={{ width: `${Math.round((logged / 7) * 100)}%` }} /></div>
          </div>

          <form action={saveDietTargetsAction} className="flex items-center gap-2 rounded-[9px] border border-[#b5843c] bg-[#fff4e0] px-2.5 py-2">
            <div className="grow text-[12px] font-black text-[#4a2f14]">Targets</div>
            <input name="calories" defaultValue={targets.calories} inputMode="numeric" className="h-8 w-16 rounded-md bg-white px-2 font-mono text-[11px] font-extrabold text-[#4a2f14]" aria-label="Calorie target" />
            <span className="text-[10px] font-extrabold text-[#8a5a24]">kcal</span>
            <input name="protein" defaultValue={targets.protein} inputMode="numeric" className="h-8 w-14 rounded-md bg-white px-2 font-mono text-[11px] font-extrabold text-[#4a2f14]" aria-label="Protein target" />
            <span className="text-[10px] font-extrabold text-[#8a5a24]">g</span>
            <button className="btn btn-cyan px-3">Save</button>
          </form>
        </div>
      </div>

      <TabBar active="/diet" exp={state.character} />
    </main>
  );
}

function Meter({ label, value, target, unit, pct, fill }: { label: string; value: number; target: number; unit: string; pct: number; fill: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 text-[11px] font-extrabold text-[#8a5a24]">{label}</div>
      <div className="bar h-3 grow" style={{ background: "#4a2f14" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: fill }} />
        <div className="bar-label"><span className="bar-pill">{value.toLocaleString()} / {target.toLocaleString()} {unit}</span></div>
      </div>
    </div>
  );
}
