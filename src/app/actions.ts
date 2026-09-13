"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { DAY_CLEAR } from "@/config/game";
import { clearSessionCookie, passwordMatches, setSessionCookie } from "@/lib/auth";
import { addTaskForDay, claimDayClear, completeMission, currentDayKey, reopenMission, skipMission } from "@/lib/services/missions";
import { syncHevy, type SyncReport } from "@/lib/services/hevy-sync";
import { setSetting } from "@/lib/services/settings";

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");
  if (!passwordMatches(password)) return { error: "Wrong password" };
  await setSessionCookie();
  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function completeMissionAction(missionId: number, value?: number) {
  const mission = await db.query.missions.findFirst({ where: (m, { eq }) => eq(m.id, missionId) });
  if (!mission) return null;
  const meta: Record<string, unknown> = {};
  if (value != null && Number.isFinite(value)) {
    meta.value = value;
    const habit = mission.habitId ? await db.query.habits.findFirst({ where: (h, { eq }) => eq(h.id, mission.habitId!) }) : null;
    if (habit?.entryMetric) {
      await db.insert(schema.metricReadings).values({ metric: habit.entryMetric, value: String(value), dayKey: mission.dayKey, source: "manual" });
    }
  }
  const result = await completeMission(missionId, meta);
  revalidatePath("/");
  revalidatePath("/week");
  return result;
}

export async function skipMissionAction(missionId: number) {
  await skipMission(missionId);
  revalidatePath("/");
}

export async function reopenMissionAction(missionId: number) {
  await reopenMission(missionId);
  revalidatePath("/");
}

export async function claimDayClearAction() {
  const dayKey = await currentDayKey();
  const ok = await claimDayClear(dayKey);
  revalidatePath("/");
  revalidatePath("/week");
  return ok ? { coins: DAY_CLEAR.coins, xp: DAY_CLEAR.xp } : null;
}

const taskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  areaId: z.string().min(1),
  effort: z.enum(["S", "M", "L"]),
});

export async function addTaskAction(_prev: { error?: string } | undefined, formData: FormData) {
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    areaId: formData.get("areaId"),
    effort: formData.get("effort"),
  });
  if (!parsed.success) return { error: "Give the task a title" };
  await addTaskForDay(parsed.data.title, parsed.data.areaId, parsed.data.effort, await currentDayKey());
  revalidatePath("/");
  return { error: undefined };
}

export async function syncHevyAction(): Promise<SyncReport | { error: string }> {
  try {
    const report = await syncHevy();
    await setSetting("hevy_last_sync", new Date().toISOString());
    revalidatePath("/");
    revalidatePath("/week");
    revalidatePath("/me");
    return report;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export async function saveTimezoneAction(formData: FormData) {
  const tz = String(formData.get("timezone") ?? "").trim();
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
  } catch {
    return;
  }
  await setSetting("timezone", tz);
  revalidatePath("/");
  revalidatePath("/me");
}
