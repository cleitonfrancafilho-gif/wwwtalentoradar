import { describe, it, expect } from "vitest";
import { parseHashtags, slowModeRemaining } from "@/lib/liveRtc";

describe("live comment timer", () => {
  it("blocks a new comment 3s after the last one with a 10s timer", () => {
    expect(slowModeRemaining(1000, 10, 4000)).toBe(7);
  });
  it("allows commenting once the timer has passed", () => {
    expect(slowModeRemaining(1000, 10, 11001)).toBe(0);
  });
  it("no timer means no wait", () => {
    expect(slowModeRemaining(1000, 0, 1500)).toBe(0);
  });
});

describe("live hashtags", () => {
  it("normalizes hashtags", () => {
    expect(parseHashtags("futebol, #treino ##treino")).toEqual(["#futebol", "#treino"]);
  });
});
