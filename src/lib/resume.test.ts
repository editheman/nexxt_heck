import { describe, expect, it } from "vitest";
import { resumeHref } from "./resume";
import { defaultState } from "./storage";

describe("resumeHref", () => {
  it("walks the profiling steps in order and ends at the portal", () => {
    const s = defaultState();
    expect(resumeHref(s)).toBe("/profil");
    s.profile = { alias: "a", savings: 1, placement: "numerar", nominalPct: 0, monthly: 0, years: 1, goal: "altul", ageRange: null, isDemo: false };
    expect(resumeHref(s)).toBe("/reality-check");
    s.progress.visited.reality = true;
    expect(resumeHref(s)).toBe("/simulator");
    s.onboarding.completedAt = "2026-10-28T10:00:00.000Z";
    expect(resumeHref(s)).toBe("/portal");
  });
});
