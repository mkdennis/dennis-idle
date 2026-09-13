/**
 * Minimal Hevy Public API client. Shapes verified against https://api.hevyapp.com/docs (Sept 2026).
 * Requires Hevy Pro; the key is sent as an `api-key` header.
 */
const BASE = "https://api.hevyapp.com/v1";

export interface HevyWorkout {
  id: string;
  title?: string;
  description?: string;
  start_time: string;
  end_time: string;
  updated_at?: string;
  created_at?: string;
  exercises?: unknown[];
}

export type HevyWorkoutEvent =
  | { type: "updated"; workout: HevyWorkout }
  | { type: "deleted"; id: string; deleted_at?: string };

export interface HevyBodyMeasurement {
  date: string; // YYYY-MM-DD
  weight_kg?: number | null;
  lean_mass_kg?: number | null;
  fat_percent?: number | null;
}

export class HevyError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

function key(): string {
  const k = process.env.HEVY_API_KEY;
  if (!k) throw new HevyError("HEVY_API_KEY is not set", 0);
  return k;
}

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { "api-key": key(), accept: "application/json" }, cache: "no-store" });
  if (!res.ok) throw new HevyError(`Hevy ${path} failed: ${res.status} ${await res.text()}`, res.status);
  return (await res.json()) as T;
}

export function hevyConfigured(): boolean {
  return Boolean(process.env.HEVY_API_KEY);
}

/** All workout events since an ISO timestamp, walking every page. */
export async function fetchWorkoutEventsSince(sinceIso: string): Promise<HevyWorkoutEvent[]> {
  const events: HevyWorkoutEvent[] = [];
  let page = 1;
  let pageCount = 1;
  do {
    const data = await get<{ page: number; page_count: number; events: HevyWorkoutEvent[] }>("/workouts/events", {
      page,
      pageSize: 10,
      since: sinceIso,
    });
    events.push(...(data.events ?? []));
    pageCount = data.page_count ?? 1;
    page += 1;
  } while (page <= pageCount && page < 200);
  return events;
}

/** Most recent body measurements (first page, newest first per Hevy). */
export async function fetchRecentBodyMeasurements(pageSize = 10): Promise<HevyBodyMeasurement[]> {
  const data = await get<{ page: number; page_count: number; body_measurements: HevyBodyMeasurement[] }>(
    "/body_measurements",
    { page: 1, pageSize },
  );
  return data.body_measurements ?? [];
}

export function workoutMinutes(w: Pick<HevyWorkout, "start_time" | "end_time">): number {
  const ms = new Date(w.end_time).getTime() - new Date(w.start_time).getTime();
  return Math.max(0, Math.round(ms / 60_000));
}
