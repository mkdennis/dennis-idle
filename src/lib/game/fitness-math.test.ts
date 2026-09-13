import { describe, expect, it } from "vitest";
import { bestPerExercise, epley1rm, weeklyBuckets } from "./fitness-math";

const TZ = "America/New_York";

describe("epley", () => {
  it("returns the weight for a single", () => expect(epley1rm(100, 1)).toBe(100));
  it("scales with reps", () => expect(epley1rm(90, 3)).toBeCloseTo(99));
  it("is zero for empty or bodyweight sets", () => {
    expect(epley1rm(0, 10)).toBe(0);
    expect(epley1rm(50, 0)).toBe(0);
  });
});

describe("best per exercise", () => {
  it("ignores warmups and keeps the top set", () => {
    const res = bestPerExercise(
      [
        { startTime: new Date("2026-09-01T20:00:00Z"), raw: { exercises: [{ title: "Bench", exercise_template_id: "B", sets: [{ type: "warmup", reps: 10, weight_kg: 200 }, { type: "normal", reps: 5, weight_kg: 80 }] }] } },
        { startTime: new Date("2026-09-08T20:00:00Z"), raw: { exercises: [{ title: "Bench", exercise_template_id: "B", sets: [{ type: "normal", reps: 2, weight_kg: 90 }] }] } },
      ],
      TZ,
    );
    expect(res).toHaveLength(1);
    expect(res[0].sessions).toBe(2);
    expect(res[0].bestE1rmKg).toBeCloseTo(96);
    expect(res[0].bestWeightKg).toBe(90);
    expect(res[0].lastDayKey).toBe("2026-09-08");
  });
  it("handles workouts with no exercises", () => {
    expect(bestPerExercise([{ startTime: new Date(), raw: {} }], TZ)).toEqual([]);
  });
});

describe("weekly buckets", () => {
  it("puts sessions in the right week and flags the current one", () => {
    const b = weeklyBuckets(
      [
        { startTime: new Date("2026-09-13T15:00:00Z"), durationMin: 70 }, // Sunday, current week (Mon 9/7)
        { startTime: new Date("2026-09-01T15:00:00Z"), durationMin: 40 }, // week of 8/31
      ],
      "2026-09-13",
      TZ,
      3,
    );
    expect(b.map((x) => x.weekStart)).toEqual(["2026-08-24", "2026-08-31", "2026-09-07"]);
    expect(b[2]).toMatchObject({ sessions: 1, countedSessions: 1, minutes: 70, isCurrent: true });
    expect(b[1]).toMatchObject({ sessions: 1, countedSessions: 0, minutes: 40 });
  });
});
