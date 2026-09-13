import { describe, expect, it } from "vitest";
import { rewardProgress } from "./rewards-math";

describe("reward progress", () => {
  it("counts from the baseline for lifetime counters", () => {
    const p = rewardProgress(15, 10, 12);
    expect(p.value).toBe(5);
    expect(p.unlocked).toBe(false);
    expect(rewardProgress(22, 10, 12).unlocked).toBe(true);
  });
  it("uses absolute values for levels", () => {
    expect(rewardProgress(4, 99, 4, true).unlocked).toBe(true);
    expect(rewardProgress(3, 0, 4, true).fraction).toBe(0.75);
  });
  it("never goes negative or divides by zero", () => {
    expect(rewardProgress(3, 10, 0).value).toBe(0);
    expect(rewardProgress(3, 10, 0).fraction).toBe(0);
  });
});
