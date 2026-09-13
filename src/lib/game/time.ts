import { DAY_CLEAR, WEEK } from "@/config/game";

/** A game day is keyed by the local calendar date at (now − resetHour). Format YYYY-MM-DD. */
export type DayKey = string;

function partsInZone(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour) % 24,
    minute: Number(map.minute),
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(map.weekday),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function keyFromYmd(y: number, m: number, d: number): DayKey {
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Shift a YYYY-MM-DD key by whole days without timezone drift. */
export function shiftKey(key: DayKey, days: number): DayKey {
  const [y, m, d] = key.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d + days);
  const dt = new Date(t);
  return keyFromYmd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/** Weekday (0 = Sunday) of a YYYY-MM-DD key. */
export function weekdayOfKey(key: DayKey): number {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function dayOfMonthOfKey(key: DayKey): number {
  return Number(key.split("-")[2]);
}

/** The game day a given instant belongs to. */
export function dayKeyFor(date: Date, timeZone: string, resetHour = DAY_CLEAR.resetHour): DayKey {
  const shifted = new Date(date.getTime() - resetHour * 3_600_000);
  const p = partsInZone(shifted, timeZone);
  return keyFromYmd(p.year, p.month, p.day);
}

/** Monday-anchored (by config) week key: the day key of the week's first day. */
export function weekStartKey(dayKey: DayKey): DayKey {
  const wd = weekdayOfKey(dayKey);
  const diff = (wd - WEEK.resetWeekday + 7) % 7;
  return shiftKey(dayKey, -diff);
}

export function monthKey(dayKey: DayKey): string {
  return dayKey.slice(0, 7);
}

/** Milliseconds until the next daily reset from `now`. */
export function msUntilReset(now: Date, timeZone: string, resetHour = DAY_CLEAR.resetHour): number {
  const p = partsInZone(now, timeZone);
  const secondsNow = p.hour * 3600 + p.minute * 60 + now.getUTCSeconds();
  let seconds = resetHour * 3600 - secondsNow;
  if (seconds <= 0) seconds += 24 * 3600;
  return seconds * 1000;
}

export function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${pad(m)}m`;
}

export function weekdayLabel(key: DayKey): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][weekdayOfKey(key)];
}
