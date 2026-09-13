/**
 * Seeds the eight life areas (Health and Money enabled) and Dennis's v1 habits.
 * Idempotent: re-running updates names and leaves existing habits alone.
 */
import { eq } from "drizzle-orm";
import { db, schema } from "./index";

const AREAS = [
  ["health", "Health", true],
  ["career", "Career", false],
  ["money", "Money", false],
  ["relationships", "Relationships", false],
  ["learning", "Learning", false],
  ["mind", "Mind", false],
  ["creative", "Creative", false],
  ["home", "Home", false],
] as const;

const HABITS: Array<Omit<typeof schema.habits.$inferInsert, "id" | "createdAt">> = [
  { title: "Gym session", areaId: "health", effort: "L", kind: "hevy_workout", weeklyTarget: 3, preferredDays: [] },
  { title: "Log weight", areaId: "health", effort: "S", kind: "hevy_weight", weeklyTarget: 1, preferredDays: [] },
  // Money is parked for now (2026-09-13). Its habits stay defined but inactive so they can be switched back on.
  { title: "Weekly budget review", areaId: "money", effort: "M", kind: "number_entry", weeklyTarget: 1, preferredDays: [0], entryLabel: "Spent this week ($)", entryMetric: "weekly_spend" , active: false },
  { title: "Log food", areaId: "health", effort: "M", kind: "diet_log", weeklyTarget: 7, preferredDays: [] },
  { title: "Monthly contribution", areaId: "money", effort: "L", kind: "manual", monthDay: 1, preferredDays: [] , active: false },
  { title: "Net worth update", areaId: "money", effort: "M", kind: "number_entry", monthDay: 1, preferredDays: [], entryLabel: "Net worth ($)", entryMetric: "net_worth" , active: false },
];

async function main() {
  for (const [i, [id, name, enabled]] of AREAS.entries()) {
    await db
      .insert(schema.areas)
      .values({ id, name, enabled, sortOrder: i })
      .onConflictDoUpdate({ target: schema.areas.id, set: { name, sortOrder: i, enabled } });
  }
  for (const h of HABITS) {
    const exists = await db.query.habits.findFirst({ where: eq(schema.habits.title, h.title) });
    if (!exists) await db.insert(schema.habits).values(h);
    else await db.update(schema.habits).set({ active: h.active ?? true }).where(eq(schema.habits.id, exists.id));
  }
  console.log(`seeded ${AREAS.length} areas, ${HABITS.length} habits`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
