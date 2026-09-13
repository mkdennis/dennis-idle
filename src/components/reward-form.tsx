"use client";

import { useActionState, useState } from "react";
import { addRewardAction } from "@/app/actions";

interface Cond { id: string; label: string; unit: string; needsArea?: boolean }

export function RewardForm({ conditions, areas }: { conditions: Cond[]; areas: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [cond, setCond] = useState(conditions[0].id);
  const [state, action, pending] = useActionState(async (prev: { error?: string } | undefined, fd: FormData) => {
    const r = await addRewardAction(prev, fd);
    if (!r.error) setOpen(false);
    return r;
  }, undefined);
  const c = conditions.find((x) => x.id === cond)!;
  if (!open) {
    return (
      <button className="mt-1 h-10 rounded-[9px] border border-dashed border-[#b7b8bd] text-xs font-extrabold text-ink-2" onClick={() => setOpen(true)}>
        + Add a reward
      </button>
    );
  }
  return (
    <form action={action} className="card flex flex-col gap-2 p-2.5">
      <input name="title" placeholder="The treat (golf lesson, new shoes…)" autoFocus className="h-10 rounded-md bg-section px-3 text-sm font-bold text-ink outline-none focus:ring-2 focus:ring-cyan" />
      <select name="condition" value={cond} onChange={(e) => setCond(e.target.value)} className="h-9 rounded-md bg-section px-2 text-xs font-extrabold text-ink">
        {conditions.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
      </select>
      <div className="flex gap-2">
        {c.needsArea && (
          <select name="param" className="h-9 grow rounded-md bg-section px-2 text-xs font-extrabold text-ink">
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
        {c.id !== "boss_defeated" && (
          <label className="flex grow items-center gap-2 text-[11px] font-extrabold text-ink-2">
            <input name="target" inputMode="numeric" placeholder="Target" className="h-9 w-24 rounded-md bg-section px-2 font-mono text-xs font-extrabold text-ink" />
            {c.unit}
          </label>
        )}
        <button className="btn btn-lime" disabled={pending}>Add</button>
        <button type="button" className="btn btn-gray px-2.5" onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className="text-[10px] font-bold text-ink-2">Counters start from today, so 10 gym sessions means ten from now.</div>
      {state?.error && <div className="text-xs font-extrabold text-red">{state.error}</div>}
    </form>
  );
}
