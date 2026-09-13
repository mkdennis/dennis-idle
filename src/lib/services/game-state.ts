import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { LIFE_POWER } from "@/config/game";
import { lifePower, type LpBreakdown } from "@/lib/game/lp";
import { areaProgress, characterProgress, avatarTier, type LevelProgress } from "@/lib/game/xp";
import { monthKey, shiftKey, type DayKey } from "@/lib/game/time";

export interface AreaView {
  id: string;
  name: string;
  xp: number;
  progress: LevelProgress;
  touchedThisWeek: boolean;
}

export interface GameState {
  areas: AreaView[];
  character: LevelProgress;
  avatarTier: number;
  lp: LpBreakdown;
  lpYesterday: number | null;
  coins: number;
  daysClearedThisMonth: number;
}

export async function loadGameState(dayKey: DayKey): Promise<GameState> {
  const enabled = await db.query.areas.findMany({ where: eq(schema.areas.enabled, true), orderBy: asc(schema.areas.sortOrder) });

  const windowStart = shiftKey(dayKey, -(LIFE_POWER.balanceWindowDays - 1));
  const touchedRows = await db
    .selectDistinct({ areaId: schema.xpEvents.areaId })
    .from(schema.xpEvents)
    .where(and(gte(schema.xpEvents.dayKey, windowStart), lte(schema.xpEvents.dayKey, dayKey)));
  const touched = new Set(touchedRows.map((r) => r.areaId));

  const month = monthKey(dayKey);
  const cleared = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.days)
    .where(and(sql`${schema.days.clearedAt} is not null`, sql`to_char(${schema.days.dayKey}, 'YYYY-MM') = ${month}`));
  const daysClearedThisMonth = cleared[0]?.n ?? 0;

  const coinRows = await db.select({ n: sql<number>`coalesce(sum(${schema.coinEvents.amount}), 0)::int` }).from(schema.coinEvents);
  const coins = coinRows[0]?.n ?? 0;

  const areas: AreaView[] = enabled.map((a) => ({
    id: a.id,
    name: a.name,
    xp: a.xp,
    progress: areaProgress(a.xp),
    touchedThisWeek: touched.has(a.id),
  }));

  const totalXp = enabled.reduce((s, a) => s + a.xp, 0);
  const character = characterProgress(totalXp);
  const lp = lifePower({
    areaXp: areas.map((a) => a.xp),
    areaTouched: areas.map((a) => a.touchedThisWeek),
    daysClearedThisMonth,
    goalsCompleted: 0,
  });

  const yesterday = await db.query.days.findFirst({ where: eq(schema.days.dayKey, shiftKey(dayKey, -1)) });

  return {
    areas,
    character,
    avatarTier: avatarTier(character.level),
    lp,
    lpYesterday: yesterday?.lpSnapshot ?? null,
    coins,
    daysClearedThisMonth,
  };
}

/** Store today's LP and level so tomorrow can show "before » after". */
export async function snapshotDay(dayKey: DayKey, state: GameState): Promise<void> {
  await db
    .insert(schema.days)
    .values({ dayKey, lpSnapshot: state.lp.total, levelSnapshot: state.character.level })
    .onConflictDoUpdate({ target: schema.days.dayKey, set: { lpSnapshot: state.lp.total, levelSnapshot: state.character.level } });
}
