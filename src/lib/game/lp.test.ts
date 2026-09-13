import { describe, expect, it } from "vitest";
import { lifePower } from "./lp";

describe("life power", () => {
  it("is the level sum times 100 with no modifiers", () => {
    const lp = lifePower({ areaXp: [0, 0], areaTouched: [true, true], daysClearedThisMonth: 0, goalsCompleted: 0 });
    expect(lp.total).toBe(200);
  });
  it("grows with cleared days and caps at 28", () => {
    const a = lifePower({ areaXp: [0, 0], areaTouched: [true, true], daysClearedThisMonth: 10, goalsCompleted: 0 });
    const b = lifePower({ areaXp: [0, 0], areaTouched: [true, true], daysClearedThisMonth: 40, goalsCompleted: 0 });
    expect(a.total).toBe(240);
    expect(b.attendanceMultiplier).toBe(1 + 0.02 * 28);
  });
  it("penalises untouched areas proportionally", () => {
    const lp = lifePower({ areaXp: [0, 0], areaTouched: [true, false], daysClearedThisMonth: 0, goalsCompleted: 0 });
    expect(lp.balanceFactor).toBeCloseTo(0.925);
    expect(lp.total).toBe(185);
  });
  it("is safe with no areas", () => {
    expect(lifePower({ areaXp: [], areaTouched: [], daysClearedThisMonth: 0, goalsCompleted: 0 }).total).toBe(0);
  });
});
