import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { Hud } from "@/components/hud";
import { LifePowerCard } from "@/components/life-power-card";
import { MissionsPanel, type MissionRow } from "@/components/missions-panel";
import { AreaCards } from "@/components/area-cards";
import { TabBar } from "@/components/tab-bar";
import { dayClearState } from "@/lib/game/day-clear";
import { dayOfMonthOfKey, formatCountdown, msUntilReset, weekdayLabel } from "@/lib/game/time";
import { loadGameState, snapshotDay } from "@/lib/services/game-state";
import { currentDayKey, habitDoneThisWeek, materializeDay } from "@/lib/services/missions";
import { maybeSyncHevy } from "@/lib/services/hevy-auto";
import { getTimeZone } from "@/lib/services/settings";
import { HEVY } from "@/config/game";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const now = new Date();
  const tz = await getTimeZone();
  const dayKey = await currentDayKey(now);
  await materializeDay(dayKey);
  await maybeSyncHevy(now);

  const [state, day, rows, habits, areaRows] = await Promise.all([
    loadGameState(dayKey),
    db.query.days.findFirst({ where: eq(schema.days.dayKey, dayKey) }),
    db.query.missions.findMany({ where: eq(schema.missions.dayKey, dayKey), orderBy: (m, { asc }) => asc(m.id) }),
    db.query.habits.findMany(),
    db.query.areas.findMany({ where: eq(schema.areas.enabled, true), orderBy: (a, { asc }) => asc(a.sortOrder) }),
  ]);
  await snapshotDay(dayKey, state);

  const habitById = new Map(habits.map((h) => [h.id, h]));
  const areaName = new Map(areaRows.map((a) => [a.id, a.name]));

  const missions: MissionRow[] = [];
  for (const m of rows) {
    const h = m.habitId ? habitById.get(m.habitId) : undefined;
    const weekDone = h?.weeklyTarget ? await habitDoneThisWeek(h.id, dayKey) : null;
    missions.push({
      id: m.id,
      title: m.title,
      areaId: m.areaId,
      areaName: areaName.get(m.areaId) ?? m.areaId,
      xp: m.xp,
      coins: m.coins,
      status: m.status,
      kind: h ? h.kind : "task",
      entryLabel: h?.entryLabel,
      subtitle: subtitleFor(m, h, weekDone, areaName.get(m.areaId) ?? m.areaId),
    });
  }

  const sorted = [...missions].sort((a, b) => rank(a.status) - rank(b.status));
  const dc = dayClearState(rows, day?.clearedAt ?? null);

  return (
    <main className="pb-28">
      <Hud state={state} countdown={formatCountdown(msUntilReset(now, tz))} dayOfMonth={dayOfMonthOfKey(dayKey)} />
      <LifePowerCard state={state} />
      <MissionsPanel missions={sorted} dayClear={dc} areas={areaRows.map((a) => ({ id: a.id, name: a.name }))} weekdayLabel={weekdayLabel(dayKey)} />
      <AreaCards areas={state.areas} />
      <TabBar active="/" exp={state.character} />
    </main>
  );
}

function rank(s: string) {
  return s === "open" ? 0 : s === "done" ? 1 : 2;
}

function subtitleFor(
  m: typeof schema.missions.$inferSelect,
  h: typeof schema.habits.$inferSelect | undefined,
  weekDone: number | null,
  area: string,
): string {
  const meta = m.meta as Record<string, unknown>;
  const parts: string[] = [];
  if (h?.kind === "hevy_workout") {
    if (m.status === "done" && typeof meta.minutes === "number") parts.push(`Hevy · ${meta.minutes} min`);
    else if (typeof meta.shortWorkoutMinutes === "number") parts.push(`Hevy · ${meta.shortWorkoutMinutes} min, under ${HEVY.minWorkoutMinutes} so not counted`);
    else parts.push(`Hevy · ${HEVY.minWorkoutMinutes}+ min counts automatically`);
  } else if (h?.kind === "hevy_weight") {
    parts.push(m.status === "done" && typeof meta.weightKg === "number" ? `Hevy · ${(meta.weightKg * 2.20462).toFixed(1)} lb` : "Hevy · log a weight in the app");
  } else if (h?.kind === "number_entry") {
    parts.push(m.status === "done" && typeof meta.value === "number" ? `${h.entryLabel?.replace(/\s*\(.*\)$/, "")}: ${meta.value.toLocaleString()}` : (h.entryLabel ?? area));
  } else if (h) {
    parts.push(area);
  } else {
    parts.push(`Task · ${area}`);
  }
  if (h?.weeklyTarget && weekDone != null) parts.push(`${weekDone}/${h.weeklyTarget} this week`);
  return parts.join(" · ");
}
