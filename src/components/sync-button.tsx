"use client";

import { useState, useTransition } from "react";
import { syncHevyAction } from "@/app/actions";
import { Refresh } from "./icons";

export function SyncButton({ disabled }: { disabled?: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        className="btn btn-cyan gap-1.5"
        disabled={disabled || pending}
        onClick={() =>
          start(async () => {
            const r = await syncHevyAction();
            setMsg("error" in r ? r.error : r.skipped ?? `${r.workoutsUpserted} workouts, ${r.measurementsAdded} weights, ${r.missionsCompleted} missions`);
          })
        }
      >
        <Refresh /> {pending ? "Syncing" : "Sync now"}
      </button>
      {msg && <div className="max-w-[160px] text-right text-[10px] font-bold text-ink-2">{msg}</div>}
    </div>
  );
}
