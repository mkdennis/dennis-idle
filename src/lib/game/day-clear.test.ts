import { describe, expect, it } from "vitest";
import { dayClearState } from "./day-clear";

const m = (status: string) => ({ status });

describe("day clear state", () => {
  it("needs at least the minimum done and everything settled", () => {
    expect(dayClearState([m("done"), m("done"), m("open")], null).claimable).toBe(false);
    expect(dayClearState([m("done"), m("done"), m("skipped")], null).claimable).toBe(true);
    expect(dayClearState([m("done")], null).claimable).toBe(false);
  });
  it("is not claimable twice or with no missions", () => {
    expect(dayClearState([m("done"), m("done")], new Date()).claimable).toBe(false);
    expect(dayClearState([], null).claimable).toBe(false);
  });
  it("reports how many more are needed", () => {
    expect(dayClearState([m("done"), m("open"), m("open")], null).remaining).toBe(2);
    expect(dayClearState([m("open")], null).remaining).toBe(2);
  });
});
