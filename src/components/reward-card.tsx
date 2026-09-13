"use client";

import { useState, useTransition } from "react";
import { claimRewardAction, deleteRewardAction } from "@/app/actions";
import { TreasureChest } from "./art";
import { Trash } from "./icons";
import type { RewardView } from "@/lib/services/rewards";

export function RewardCard({ r, areaName }: { r: RewardView; areaName?: string }) {
  const [pending, start] = useTransition();
  const [celebrate, setCelebrate] = useState(false);
  const claimed = r.claimedAt != null;
  const unlocked = r.progress.unlocked && !claimed;
  const detail =
    r.condition === "area_level" ? `${areaName ?? r.param} level ${r.progress.value} of ${r.progress.target}`
    : r.condition === "boss_defeated" ? (r.progress.unlocked ? "Boss defeated" : "Boss still standing")
    : `${r.progress.value} of ${r.progress.target} ${r.unit}`;

  return (
    <div className={`flex items-center gap-3 rounded-[9px] px-2.5 py-2 ${claimed ? "card-done" : unlocked ? "border-2 border-gold bg-[#fff8e0]" : "bg-card"}`}>
      <div className="shrink-0"><TreasureChest size={56} open={unlocked || claimed} /></div>
      <div className="flex grow flex-col gap-1">
        <div className={`text-[13px] font-black ${claimed ? "text-ink-2 line-through" : "text-ink"}`}>{r.title}</div>
        <div className="text-[11px] font-bold text-ink-2">{r.conditionLabel} · {detail}</div>
        {!claimed && r.condition !== "boss_defeated" && (
          <div className="bar h-2.5"><div className="bar-fill" style={{ width: `${Math.round(r.progress.fraction * 100)}%` }} /></div>
        )}
        {claimed && <div className="text-[10px] font-extrabold text-ink-2">Claimed {r.claimedAt!.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {unlocked ? (
          <button className="btn btn-lime" disabled={pending} onClick={() => start(async () => { if (await claimRewardAction(r.id)) setCelebrate(true); })}>Claim</button>
        ) : claimed ? (
          <span className="btn btn-gray px-2.5 text-[11px]">Enjoyed</span>
        ) : (
          <span className="btn btn-gray px-2.5 text-[11px]">Locked</span>
        )}
        <button className="flex h-6 w-6 items-center justify-center text-ink-2" aria-label="Delete reward" onClick={() => start(async () => { await deleteRewardAction(r.id); })}><Trash /></button>
      </div>
      {celebrate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-6" onClick={() => setCelebrate(false)}>
          <div className="panel pop w-full max-w-[330px]" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head h-11 justify-center">Reward Unlocked</div>
            <div className="flex flex-col items-center gap-1 py-5" style={{ background: "var(--sky-grad)" }}>
              <TreasureChest size={110} open />
              <div className="text-[22px] font-black text-white" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.18)" }}>{r.title}</div>
              <div className="text-xs font-extrabold text-white/95">You earned it. Go do it.</div>
            </div>
            <div className="panel-body p-3.5"><button className="btn btn-lime h-[46px] w-full text-[15px]" onClick={() => setCelebrate(false)}>Nice</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
