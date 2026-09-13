import { Clock, Coin, Sword } from "./icons";
import type { GameState } from "@/lib/services/game-state";

export function Hud({ state, countdown, dayOfMonth }: { state: GameState; countdown: string; dayOfMonth: number }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 pt-3.5">
      <div className="relative h-[46px] w-[46px] shrink-0 overflow-hidden rounded-[10px] border-[1.5px] border-[#4a4b52] bg-chrome-2">
        <Avatar tier={state.avatarTier} />
        <div className="absolute inset-x-0 bottom-0 bg-black/75 text-center text-[10px] font-black leading-[14px] text-gold">Lv {state.character.level}</div>
      </div>
      <div className="flex grow flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="hud-chip"><Sword className="text-white" /> {state.lp.total.toLocaleString()}</span>
          <span className="hud-chip"><Coin /> {state.coins.toLocaleString()}</span>
        </div>
        <div className="text-[11px] font-extrabold tracking-wide text-muted">
          TIER {state.avatarTier} · CLEARED {state.daysClearedThisMonth} · DAY {dayOfMonth}
        </div>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-black/45 px-2 py-1.5 font-mono text-[11px] font-extrabold text-white">
        <Clock /> {countdown}
      </div>
    </div>
  );
}

/** Six tiers, one simple figure each. Placeholder art until real sprites exist. */
export function Avatar({ tier }: { tier: number }) {
  const shirt = ["#3b6cff", "#2fbf5a", "#f2b90c", "#e0304a", "#7c3aed", "#111111"][Math.min(5, tier - 1)];
  const bg = ["#8fd0f0", "#a9e6b8", "#ffe08a", "#ffb3bd", "#d8c4ff", "#c8c8c8"][Math.min(5, tier - 1)];
  return (
    <svg viewBox="0 0 46 46" width="46" height="46" aria-hidden>
      <rect width="46" height="46" fill={bg} />
      <circle cx="23" cy="20" r="9" fill="#f6d2b4" />
      <path d="M14 19 C 15 9, 31 9, 32 19 C 28 15, 18 15, 14 19 Z" fill="#2b1d16" />
      <path d="M9 46 C 9 33, 37 33, 37 46 Z" fill={shirt} />
    </svg>
  );
}
