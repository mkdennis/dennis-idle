import { boolean, date, integer, jsonb, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const areas = pgTable("areas", {
  id: text("id").primaryKey(), // 'health', 'money', ...
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: boolean("enabled").notNull().default(false),
  xp: integer("xp").notNull().default(0),
});

export type HabitKind = "manual" | "hevy_workout" | "hevy_weight" | "number_entry" | "diet_log";

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  areaId: text("area_id").notNull().references(() => areas.id),
  effort: text("effort").notNull().$type<"S" | "M" | "L">(),
  kind: text("kind").notNull().$type<HabitKind>().default("manual"),
  /** Times per week the habit should be done. Null for monthly habits. */
  weeklyTarget: integer("weekly_target"),
  /** Weekdays (0 = Sunday) the habit is suggested on. Empty = any day until target met. */
  preferredDays: jsonb("preferred_days").$type<number[]>().notNull().default([]),
  /** Day of month for monthly habits (e.g. 1). Null for weekly habits. */
  monthDay: integer("month_day"),
  /** For number_entry: label shown in the input, and the metric it records. */
  entryLabel: text("entry_label"),
  entryMetric: text("entry_metric"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  areaId: text("area_id").notNull().references(() => areas.id),
  effort: text("effort").notNull().$type<"S" | "M" | "L">(),
  plannedFor: date("planned_for"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MissionStatus = "open" | "done" | "skipped";

export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  dayKey: date("day_key").notNull(),
  sourceType: text("source_type").notNull().$type<"habit" | "task">(),
  habitId: integer("habit_id").references(() => habits.id),
  taskId: integer("task_id").references(() => tasks.id),
  title: text("title").notNull(),
  areaId: text("area_id").notNull().references(() => areas.id),
  xp: integer("xp").notNull(),
  coins: integer("coins").notNull(),
  status: text("status").notNull().$type<MissionStatus>().default("open"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  /** Free-form details: workout minutes, entered value, hevy ids. */
  meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const days = pgTable("days", {
  dayKey: date("day_key").primaryKey(),
  clearedAt: timestamp("cleared_at", { withTimezone: true }),
  lpSnapshot: integer("lp_snapshot"),
  levelSnapshot: integer("level_snapshot"),
});

export const xpEvents = pgTable("xp_events", {
  id: serial("id").primaryKey(),
  areaId: text("area_id").references(() => areas.id),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  missionId: integer("mission_id").references(() => missions.id),
  dayKey: date("day_key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const coinEvents = pgTable("coin_events", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  dayKey: date("day_key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: text("id").primaryKey(), // Hevy workout id
  title: text("title"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  durationMin: integer("duration_min").notNull(),
  raw: jsonb("raw").$type<Record<string, unknown>>().notNull(),
  syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
});

export const metricReadings = pgTable("metric_readings", {
  id: serial("id").primaryKey(),
  metric: text("metric").notNull(), // weight_kg, fat_percent, weekly_spend, net_worth
  value: numeric("value", { precision: 14, scale: 3 }).notNull(),
  dayKey: date("day_key").notNull(),
  source: text("source").notNull(), // hevy | manual
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/** One row per game day of food logging. Calories and grams are whole numbers. */
export const dietDays = pgTable("diet_days", {
  dayKey: date("day_key").primaryKey(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs"),
  fat: integer("fat"),
  note: text("note"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
