import { describe, expect, it } from "vitest";
import { areaLevel, areaProgress, avatarTier, characterLevel, xpForAreaLevel } from "./xp";

describe("area level curve", () => {
  it("level 1 costs nothing, level 2 costs 283", () => {
    expect(xpForAreaLevel(1)).toBe(0);
    expect(xpForAreaLevel(2)).toBe(283);
    expect(xpForAreaLevel(5)).toBe(1118);
    expect(xpForAreaLevel(10)).toBe(3162);
  });
  it("maps xp to levels at the boundaries", () => {
    expect(areaLevel(0)).toBe(1);
    expect(areaLevel(282)).toBe(1);
    expect(areaLevel(283)).toBe(2);
    expect(areaLevel(1117)).toBe(4);
    expect(areaLevel(1118)).toBe(5);
  });
  it("handles negative and huge xp", () => {
    expect(areaLevel(-50)).toBe(1);
    expect(areaLevel(1_000_000)).toBeGreaterThan(50);
  });
  it("reports progress inside a level", () => {
    const p = areaProgress(500);
    expect(p.level).toBe(2);
    expect(p.into).toBe(500 - 283);
    expect(p.span).toBe(xpForAreaLevel(3) - 283);
    expect(p.toNext).toBe(xpForAreaLevel(3) - 500);
  });
});

describe("character level", () => {
  it("uses a curve four times as long", () => {
    expect(characterLevel(0)).toBe(1);
    expect(characterLevel(283 * 4 - 1)).toBe(1);
    expect(characterLevel(283 * 4)).toBe(2);
  });
});

describe("avatar tier", () => {
  it("steps at the configured bands", () => {
    expect(avatarTier(1)).toBe(1);
    expect(avatarTier(4)).toBe(1);
    expect(avatarTier(5)).toBe(2);
    expect(avatarTier(50)).toBe(6);
    expect(avatarTier(99)).toBe(6);
  });
});
