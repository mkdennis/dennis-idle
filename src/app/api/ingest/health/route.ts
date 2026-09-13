import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { saveDietDay } from "@/lib/services/diet";
import { currentDayKey, materializeDay, completeMission } from "@/lib/services/missions";
import { shiftKey, weekStartKey } from "@/lib/game/time";

export const dynamic = "force-dynamic";

/**
 * Receives a day's nutrition (and optionally weight) from an iOS Shortcut reading Apple Health,
 * which MacroFactor writes to. Auth: `Authorization: Bearer <INGEST_TOKEN>`.
 *
 * Body: { date?: "YYYY-MM-DD", calories: number, protein: number, carbs?: number, fat?: number, weight_kg?: number, weight_lb?: number }
 */
const bodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  calories: z.coerce.number().min(0).max(20000),
  protein: z.coerce.number().min(0).max(1000),
  carbs: z.coerce.number().min(0).max(2000).optional(),
  fat: z.coerce.number().min(0).max(1000).optional(),
  weight_kg: z.coerce.number().min(20).max(400).optional(),
  weight_lb: z.coerce.number().min(40).max(900).optional(),
});

function authorized(req: Request): boolean {
  const token = process.env.INGEST_TOKEN;
  const header = req.headers.get("authorization") ?? "";
  const given = header.replace(/^Bearer\s+/i, "");
  if (!token || !given || token.length !== given.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(given));
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad body", issues: parsed.error.issues }, { status: 400 });
  const b = parsed.data;

  const dayKey = b.date ?? (await currentDayKey());
  await materializeDay(dayKey);

  // Only overwrite a manual entry with Apple Health data if the day has no manual entry, or it came from health before.
  const existing = await db.query.dietDays.findFirst({ where: eq(schema.dietDays.dayKey, dayKey) });
  let diet: { missionXp: number | null } | null = null;
  if (!existing || existing.source === "apple_health" || b.calories > 0) {
    diet = await saveDietDay(dayKey, {
      calories: Math.round(b.calories),
      protein: Math.round(b.protein),
      carbs: b.carbs != null ? Math.round(b.carbs) : null,
      fat: b.fat != null ? Math.round(b.fat) : null,
    });
    await db.update(schema.dietDays).set({ source: "apple_health" }).where(eq(schema.dietDays.dayKey, dayKey));
  }

  let weightMission = 0;
  const weightKg = b.weight_kg ?? (b.weight_lb != null ? b.weight_lb / 2.20462 : undefined);
  if (weightKg != null) {
    const dup = await db.query.metricReadings.findFirst({
      where: and(eq(schema.metricReadings.metric, "weight_kg"), eq(schema.metricReadings.dayKey, dayKey), eq(schema.metricReadings.source, "apple_health")),
    });
    if (!dup) await db.insert(schema.metricReadings).values({ metric: "weight_kg", value: weightKg.toFixed(2), dayKey, source: "apple_health" });
    const habit = await db.query.habits.findFirst({ where: and(eq(schema.habits.kind, "hevy_weight"), eq(schema.habits.active, true)) });
    if (habit) {
      const start = weekStartKey(dayKey);
      const end = shiftKey(start, 6);
      const mission = await db.query.missions.findFirst({
        where: (m, { and, eq, gte, lte }) => and(eq(m.habitId, habit.id), eq(m.status, "open"), gte(m.dayKey, start), lte(m.dayKey, end)),
      });
      if (mission) weightMission = (await completeMission(mission.id, { weightKg, source: "apple_health" })) ? 1 : 0;
    }
  }

  return NextResponse.json({ ok: true, dayKey, foodLogged: diet != null, missionXp: diet?.missionXp ?? null, weightMissionCompleted: weightMission === 1 });
}
