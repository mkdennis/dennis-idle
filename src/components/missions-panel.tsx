"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { addTaskAction, claimDayClearAction, completeMissionAction, reopenMissionAction, skipMissionAction } from "@/app/actions";
import { Check, Close, Coin } from "./icons";
import type { DayClearState } from "@/lib/game/day-clear";
import { DAY_CLEAR } from "@/config/game";

export interface MissionRow {
  id: number;
  title: string;
  areaId: string;
  areaName: string;
  xp: number;
  coins: number;
  status: "open" | "done" | "skipped";
  kind: "manual" | "hevy_workout" | "hevy_weight" | "number_entry" | "diet_log" | "task";
  subtitle: string;
  entryLabel?: string | null;
}

interface Props {
  missions: MissionRow[];
  dayClear: DayClearState;
  areas: { id: string; name: string }[];
  weekdayLabel: string;
}

export function MissionsPanel({ missions, dayClear, areas, weekdayLabel }: Props) {
  const [pending, start] = useTransition();
  const [entryFor, setEntryFor] = useState<MissionRow | null>(null);
  const [celebration, setCelebration] = useState<{ coins: number; xp: number } | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const done = missions.filter((m) => m.status === "done").length;
  const pct = missions.length ? Math.round((done / missions.length) * 100) : 0;

  return (
    <div className="panel mx-3.5 mt-3">
      <div className="panel-head">
        <span>Daily Missions</span>
        <span className="font-mono text-xs">{done} / {missions.length}</span>
      </div>
      <div className="panel-body">
        {/* Capstone */}
        <div className="flex items-center gap-2.5 rounded-[9px] bg-card-dark px-2.5 py-2">
          <div className="flex grow flex-col gap-1.5">
            <div className="text-[13px] font-black text-white">Day Clear</div>
            <div className="bar h-2.5" style={{ background: "#2b2c30" }}>
              <div className="bar-fill" style={{ width: `${pct}%` }} />
              <div className="absolute inset-0 flex items-center justify-end pr-1.5 font-mono text-[9px] font-extrabold text-white">{done}/{missions.length}</div>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <div className="reward-tile"><div className="flex h-7 items-center"><Coin size={16} /></div><div className="reward-tile-strip">{DAY_CLEAR.coins}</div></div>
            <div className="reward-tile"><div className="flex h-7 items-center text-[10px] font-black text-ink">XP</div><div className="reward-tile-strip">{DAY_CLEAR.xp}</div></div>
          </div>
          <button
            className={`btn shrink-0 ${dayClear.claimable ? "btn-lime" : "btn-gray"}`}
            disabled={!dayClear.claimable || pending}
            onClick={() => start(async () => { const r = await claimDayClearAction(); if (r) setCelebration(r); })}
          >
            {dayClear.claimed ? "Cleared" : "Claim"}
          </button>
        </div>

        {missions.map((m) => (
          <Row key={m.id} m={m} pending={pending} onGo={() => (m.kind === "number_entry" ? setEntryFor(m) : start(async () => { await completeMissionAction(m.id); }))} onSkip={() => start(async () => { await skipMissionAction(m.id); })} onReopen={() => start(async () => { await reopenMissionAction(m.id); })} />
        ))}

        {missions.length === 0 && <div className="px-2 py-3 text-center text-xs font-bold text-ink-2">Nothing due today. Add a task to make it count.</div>}

        {showAdd ? (
          <AddTask areas={areas} onDone={() => setShowAdd(false)} />
        ) : (
          <button className="mt-1 h-9 rounded-[9px] border border-dashed border-[#b7b8bd] text-xs font-extrabold text-ink-2" onClick={() => setShowAdd(true)}>
            + Add a task for {weekdayLabel}
          </button>
        )}
      </div>

      {entryFor && (
        <EntrySheet
          m={entryFor}
          onClose={() => setEntryFor(null)}
          onSubmit={(v) => start(async () => { await completeMissionAction(entryFor.id, v); setEntryFor(null); })}
        />
      )}
      {celebration && <Celebration reward={celebration} weekdayLabel={weekdayLabel} done={done} total={missions.length} onClose={() => setCelebration(null)} />}
    </div>
  );
}

function Row({ m, pending, onGo, onSkip, onReopen }: { m: MissionRow; pending: boolean; onGo: () => void; onSkip: () => void; onReopen: () => void }) {
  const done = m.status === "done";
  const skipped = m.status === "skipped";
  return (
    <div className={`card flex min-h-[52px] items-center gap-2.5 px-2.5 py-2 ${done || skipped ? "card-done" : ""}`}>
      <div className="flex grow flex-col gap-px">
        <div className={`text-[13px] font-extrabold ${done || skipped ? "text-ink-2 line-through" : "text-ink"}`}>{m.title}</div>
        <div className={`text-[11px] font-bold ${done || skipped ? "text-ink-3" : "text-ink-2"}`}>{m.subtitle}</div>
      </div>
      <div className={`reward-tile ${done || skipped ? "opacity-70" : ""}`} style={done || skipped ? { background: "#e6e7ea" } : { background: "#e6e7ea" }}>
        <div className="flex h-[26px] items-center text-[10px] font-black text-ink">XP</div>
        <div className="reward-tile-strip" style={done || skipped ? { background: "#6f7076" } : undefined}>{m.xp}</div>
      </div>
      {done ? (
        <span className="btn btn-gray shrink-0 px-2.5 text-[11px]">Claimed</span>
      ) : skipped ? (
        <button className="btn btn-gray shrink-0 px-2.5 text-[11px]" onClick={onReopen} disabled={pending}>Skipped</button>
      ) : (
        <div className="flex shrink-0 items-center gap-1">
          {m.kind === "diet_log" ? (
            <Link href="/diet" className="btn btn-cyan">Go</Link>
          ) : (
            <button className="btn btn-cyan" onClick={onGo} disabled={pending}>{m.kind === "number_entry" ? "Go" : "Done"}</button>
          )}
          <button className="flex h-8 w-6 items-center justify-center text-ink-2" title="Skip today" onClick={onSkip} disabled={pending} aria-label="Skip">
            <Close size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

function EntrySheet({ m, onClose, onSubmit }: { m: MissionRow; onClose: () => void; onSubmit: (v: number) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="panel pop w-full max-w-[430px] rounded-b-none" onClick={(e) => e.stopPropagation()}>
        <div className="panel-head"><span>{m.title}</span><button onClick={onClose} aria-label="Close"><Close /></button></div>
        <form
          className="panel-body gap-3 p-4 pb-[max(16px,env(safe-area-inset-bottom))]"
          onSubmit={(e) => { e.preventDefault(); const n = Number(v); if (Number.isFinite(n)) onSubmit(n); }}
        >
          <label className="flex flex-col gap-1 text-xs font-extrabold text-ink-2">
            {m.entryLabel ?? "Value"}
            <input inputMode="decimal" autoFocus value={v} onChange={(e) => setV(e.target.value)} className="card h-11 px-3 text-base font-bold text-ink outline-none focus:ring-2 focus:ring-cyan" />
          </label>
          <button className="btn btn-lime h-11 w-full text-sm" disabled={v.trim() === ""}>Claim +{m.xp} XP</button>
        </form>
      </div>
    </div>
  );
}

function AddTask({ areas, onDone }: { areas: { id: string; name: string }[]; onDone: () => void }) {
  const [state, action, pending] = useActionState(async (prev: { error?: string } | undefined, fd: FormData) => {
    const r = await addTaskAction(prev, fd);
    if (!r.error) onDone();
    return r;
  }, undefined);
  return (
    <form action={action} className="card flex flex-col gap-2 p-2.5">
      <input name="title" placeholder="What needs doing?" autoFocus className="h-10 rounded-md bg-section px-3 text-sm font-bold text-ink outline-none focus:ring-2 focus:ring-cyan" />
      <div className="flex gap-2">
        <select name="areaId" className="h-9 grow rounded-md bg-section px-2 text-xs font-extrabold text-ink">
          {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select name="effort" defaultValue="S" className="h-9 w-24 rounded-md bg-section px-2 text-xs font-extrabold text-ink">
          <option value="S">S · 10 XP</option>
          <option value="M">M · 25 XP</option>
          <option value="L">L · 50 XP</option>
        </select>
        <button className="btn btn-cyan" disabled={pending}>Add</button>
        <button type="button" className="btn btn-gray px-2.5" onClick={onDone}>✕</button>
      </div>
      {state?.error && <div className="text-xs font-extrabold text-red">{state.error}</div>}
    </form>
  );
}

function Celebration({ reward, weekdayLabel, done, total, onClose }: { reward: { coins: number; xp: number }; weekdayLabel: string; done: number; total: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-6" onClick={onClose}>
      <div className="panel pop w-full max-w-[330px]" onClick={(e) => e.stopPropagation()}>
        <div className="panel-head h-11 justify-center">Daily Mission Clear</div>
        <div className="relative flex h-24 flex-col items-center justify-center gap-0.5" style={{ background: "var(--sky-grad)" }}>
          <div className="text-[34px] font-black leading-none tracking-wide text-white" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.18)" }}>DAY CLEAR</div>
          <div className="text-xs font-extrabold text-white/95">{weekdayLabel} · {done} of {total} missions</div>
        </div>
        <div className="panel-body items-center gap-3 p-3.5">
          <div className="flex gap-2.5">
            <div className="flex w-[74px] flex-col items-center overflow-hidden rounded-lg bg-card">
              <div className="flex h-[58px] items-center"><Coin size={32} /></div>
              <div className="w-full bg-tile-strip text-center font-mono text-[11px] font-extrabold leading-[18px] text-white">{reward.coins}</div>
            </div>
            <div className="flex w-[74px] flex-col items-center overflow-hidden rounded-lg bg-card">
              <div className="flex h-[58px] items-center text-lg font-black text-ink">XP</div>
              <div className="w-full bg-tile-strip text-center font-mono text-[11px] font-extrabold leading-[18px] text-white">{reward.xp}</div>
            </div>
          </div>
          <button className="btn btn-lime h-[46px] w-full text-[15px]" onClick={onClose}>Claim Reward</button>
        </div>
      </div>
    </div>
  );
}

export { Check };
