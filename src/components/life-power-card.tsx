import { Chevrons } from "./icons";
import type { GameState } from "@/lib/services/game-state";

export function LifePowerCard({ state }: { state: GameState }) {
  const c = state.character;
  const before = state.lpYesterday;
  return (
    <div className="card mx-3.5 mt-3 flex flex-col gap-2 px-3.5 py-3" style={{ boxShadow: "0 2px 0 rgba(0,0,0,0.25)" }}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="text-sm font-black text-ink">Life Power</div>
          <div className="flex items-baseline gap-2">
            {before != null && before !== state.lp.total && (
              <>
                <div className="font-mono text-[22px] font-extrabold tracking-tight text-ink-2">{before.toLocaleString()}</div>
                <Chevrons className="text-[#9a9ba1]" />
              </>
            )}
            <div className="font-mono text-[34px] font-extrabold leading-none tracking-tight text-cyan-2">{state.lp.total.toLocaleString()}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 pt-1 text-right">
          <div className="font-mono text-[11px] font-extrabold text-ink-2">balance ×{state.lp.balanceFactor.toFixed(2)}</div>
          <div className="font-mono text-[11px] font-extrabold text-ink-2">attendance ×{state.lp.attendanceMultiplier.toFixed(2)}</div>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="shrink-0 text-xs font-black text-gold-ink">Lv {c.level}</div>
        <div className="bar h-3 grow">
          <div className="bar-fill" style={{ width: `${Math.round(c.fraction * 100)}%` }} />
          <div className="bar-label">
            <span className="bar-pill">{c.into.toLocaleString()} / {c.span.toLocaleString()}</span>
          </div>
        </div>
        <div className="shrink-0 text-xs font-black text-ink-2">Lv {c.level + 1}</div>
      </div>
    </div>
  );
}
