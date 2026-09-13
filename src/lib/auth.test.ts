import { beforeAll, describe, expect, it } from "vitest";
import { makeSessionToken, verifySessionToken } from "./auth";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-that-is-long-enough";
});

describe("session tokens", () => {
  it("round-trips a fresh token", () => {
    expect(verifySessionToken(makeSessionToken())).toBe(true);
  });
  it("rejects tampering, junk, and expiry", () => {
    const t = makeSessionToken();
    expect(verifySessionToken(t + "x")).toBe(false);
    expect(verifySessionToken("nope")).toBe(false);
    expect(verifySessionToken(undefined)).toBe(false);
    expect(verifySessionToken("")).toBe(false);
    const old = makeSessionToken(Date.now() - 100 * 24 * 3600 * 1000);
    expect(verifySessionToken(old)).toBe(false);
  });
});
