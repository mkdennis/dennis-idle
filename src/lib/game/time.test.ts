import { describe, expect, it } from "vitest";
import { dayKeyFor, formatCountdown, msUntilReset, shiftKey, weekStartKey, weekdayOfKey } from "./time";

const TZ = "America/New_York";

describe("day key with a 04:00 reset", () => {
  it("counts 03:59 local as the previous day and 04:00 as the new day", () => {
    // 2026-09-13 is a Sunday. EDT is UTC-4, so 03:59 local = 07:59Z.
    expect(dayKeyFor(new Date("2026-09-13T07:59:00Z"), TZ)).toBe("2026-09-12");
    expect(dayKeyFor(new Date("2026-09-13T08:00:00Z"), TZ)).toBe("2026-09-13");
  });
  it("rolls over month and year boundaries", () => {
    expect(dayKeyFor(new Date("2027-01-01T06:00:00Z"), TZ)).toBe("2026-12-31"); // 01:00 local Jan 1
    expect(dayKeyFor(new Date("2027-01-01T09:30:00Z"), TZ)).toBe("2027-01-01");
  });
});

describe("week and shifting", () => {
  it("anchors weeks on Monday", () => {
    expect(weekStartKey("2026-09-13")).toBe("2026-09-07"); // Sunday -> previous Monday
    expect(weekStartKey("2026-09-14")).toBe("2026-09-14"); // Monday stays
    expect(weekStartKey("2026-09-19")).toBe("2026-09-14"); // Saturday
  });
  it("shifts across month ends", () => {
    expect(shiftKey("2026-02-28", 1)).toBe("2026-03-01");
    expect(shiftKey("2026-03-01", -1)).toBe("2026-02-28");
    expect(weekdayOfKey("2026-09-13")).toBe(0);
  });
});

describe("reset countdown", () => {
  it("counts down to 04:00 local", () => {
    // 22:00 local Sept 13 = 02:00Z Sept 14 -> 6h to 04:00
    const ms = msUntilReset(new Date("2026-09-14T02:00:00Z"), TZ);
    expect(formatCountdown(ms)).toBe("6h 00m");
  });
  it("wraps when it is already past reset", () => {
    const ms = msUntilReset(new Date("2026-09-13T09:00:00Z"), TZ); // 05:00 local
    expect(formatCountdown(ms)).toBe("23h 00m");
  });
});
