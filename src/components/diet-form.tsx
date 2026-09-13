"use client";

import { useActionState } from "react";
import { saveDietAction } from "@/app/actions";

interface Today { calories: number; protein: number; carbs: number | null; fat: number | null; note: string | null }

export function DietForm({ today }: { today: Today | null }) {
  const [state, action, pending] = useActionState(saveDietAction, undefined);
  const field = "h-10 w-full rounded-md bg-white px-2 font-mono text-[13px] font-extrabold text-[#4a2f14] outline-none focus:ring-2 focus:ring-cyan";
  return (
    <form action={action} className="flex flex-col gap-2 rounded-[9px] border border-[#b5843c] bg-[#fff4e0] px-3 py-2.5">
      <div className="text-[13px] font-black text-[#4a2f14]">{today ? "Update today" : "Log today"}</div>
      <div className="grid grid-cols-4 gap-2">
        <label className="flex flex-col gap-0.5 text-[10px] font-extrabold text-[#8a5a24]">kcal<input name="calories" inputMode="numeric" required defaultValue={today?.calories ?? ""} className={field} /></label>
        <label className="flex flex-col gap-0.5 text-[10px] font-extrabold text-[#8a5a24]">protein g<input name="protein" inputMode="numeric" required defaultValue={today?.protein ?? ""} className={field} /></label>
        <label className="flex flex-col gap-0.5 text-[10px] font-extrabold text-[#8a5a24]">carbs g<input name="carbs" inputMode="numeric" defaultValue={today?.carbs ?? ""} className={field} /></label>
        <label className="flex flex-col gap-0.5 text-[10px] font-extrabold text-[#8a5a24]">fat g<input name="fat" inputMode="numeric" defaultValue={today?.fat ?? ""} className={field} /></label>
      </div>
      <input name="note" placeholder="Note (optional)" defaultValue={today?.note ?? ""} className="h-9 rounded-md bg-white px-2 text-[12px] font-bold text-[#4a2f14] outline-none focus:ring-2 focus:ring-cyan" />
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-extrabold text-[#8a5a24]">
          {state?.error ? <span className="text-red">{state.error}</span> : state?.savedXp ? `Saved · +${state.savedXp} XP` : state && !state.error ? "Saved" : ""}
        </div>
        <button className="btn btn-lime px-4" disabled={pending}>{pending ? "Saving" : today ? "Update" : "Claim"}</button>
      </div>
    </form>
  );
}
