"use client";

import { useState } from "react";
import { saveBossAction } from "@/app/actions";

interface Ex { id: string; title: string; bestLb: number; sessions: number }

export function BossPicker({ exercises, current }: { exercises: Ex[]; current: { id: string; targetLb: number } | null }) {
  const [open, setOpen] = useState(current == null);
  const [id, setId] = useState(current?.id ?? exercises[0]?.id ?? "");
  const chosen = exercises.find((e) => e.id === id);
  if (!open) {
    return <button className="btn btn-gray self-end px-3 text-[11px]" onClick={() => setOpen(true)}>Change boss</button>;
  }
  if (exercises.length === 0) return <div className="text-[11px] font-bold text-[#e9d5ff]">Sync a Hevy workout first.</div>;
  return (
    <form
      action={async (fd) => {
        const lb = Number(fd.get("targetLb"));
        fd.set("targetKg", String(lb / 2.20462));
        await saveBossAction(fd);
        setOpen(false);
      }}
      className="flex flex-col gap-2 rounded-[9px] bg-black/30 p-2.5"
    >
      <input type="hidden" name="templateId" value={id} />
      <select value={id} onChange={(e) => setId(e.target.value)} className="h-9 rounded-md bg-card px-2 text-xs font-extrabold text-ink">
        {exercises.map((e) => (
          <option key={e.id} value={e.id}>{e.title} · best {e.bestLb} lb · {e.sessions}×</option>
        ))}
      </select>
      <div className="flex gap-2">
        <input name="targetLb" inputMode="numeric" placeholder="Target lb" defaultValue={current?.targetLb ?? (chosen ? Math.round(chosen.bestLb * 1.1 / 5) * 5 : "")} className="h-9 grow rounded-md bg-card px-2 font-mono text-xs font-extrabold text-ink" />
        <button className="btn btn-lime">Set boss</button>
        {current && <button type="button" className="btn btn-gray" onClick={() => setOpen(false)}>Cancel</button>}
      </div>
    </form>
  );
}
