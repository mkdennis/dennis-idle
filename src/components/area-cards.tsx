import type { AreaView } from "@/lib/services/game-state";

export function AreaCards({ areas }: { areas: AreaView[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 px-3.5 pt-3">
      {areas.map((a) => (
        <div key={a.id} className="card flex flex-col gap-[7px] px-3 py-2.5" style={{ boxShadow: "0 2px 0 rgba(0,0,0,0.25)" }}>
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-black text-ink">{a.name}</div>
            <div className="flex items-center gap-1.5">
              {!a.touchedThisWeek && <span className="h-2 w-2 rounded-full bg-red" title="Untouched this week" />}
              <div className="text-xs font-black text-gold-ink">Lv {a.progress.level}</div>
            </div>
          </div>
          <div className="bar h-3">
            <div className="bar-fill" style={{ width: `${Math.round(a.progress.fraction * 100)}%` }} />
            <div className="bar-label">
              <span className="bar-pill">{a.progress.into.toLocaleString()} / {a.progress.span.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
