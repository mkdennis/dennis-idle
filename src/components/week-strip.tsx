import Link from "next/link";
import { and, gte, lte } from "drizzle-orm";
import { db, schema } from "@/db";
import { Check } from "./icons";
import { dayClearState } from "@/lib/game/day-clear";
import { shiftKey, weekStartKey, type DayKey } from "@/lib/game/time";

const LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export async function WeekStrip({ today }: { today: DayKey }) {
  const start = weekStartKey(today);
  const end = shiftKey(start, 6);
  const keys = Array.from({ length: 7 }, (_, i) => shiftKey(start, i));
  const [days, missions] = await Promise.all([
    db.query.days.findMany({ where: and(gte(schema.days.dayKey, start), lte(schema.days.dayKey, end)) }),
    db.query.missions.findMany({ where: and(gte(schema.missions.dayKey, start), lte(schema.missions.dayKey, end)) }),
  ]);
  const dayByKey = new Map(days.map((d) => [d.dayKey, d]));
  const tiles = keys.map((k, i) => {
    const dc = dayClearState(missions.filter((m) => m.dayKey === k), dayByKey.get(k)?.clearedAt ?? null);
    return { key: k, letter: LETTERS[i], isToday: k === today, future: k > today, cleared: dc.claimed, done: dc.done, total: dc.total };
  });
  return (
    <Link href="/week" className="panel mx-3.5 mt-3 block">
      <div className="panel-head h-8 text-xs"><span>This Week</span><span className="font-mono text-[10px] text-muted">{tiles.filter((t) => t.cleared).length} cleared · details</span></div>
      <div className="panel-body p-2">
        <div className="grid grid-cols-7 gap-1.5">
          {tiles.map((t) => (
            <div key={t.key} className="flex flex-col items-center gap-0.5">
              <div className={`text-[9px] font-extrabold ${t.isToday ? "text-cyan-2" : "text-[#8a8b90]"}`}>{t.letter}</div>
              <div className={`flex h-7 w-full items-center justify-center rounded-md font-mono text-[9px] font-extrabold ${t.cleared ? "bg-lime text-white" : t.isToday ? "border-2 border-cyan bg-card text-ink" : "bg-card text-ink-2"}`}>
                {t.cleared ? <Check size={12} className="text-white" /> : t.future ? "" : t.total ? `${t.done}/${t.total}` : "–"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
