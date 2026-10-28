import { describe, expect, it } from "vitest";
import { defaultState, parseState, serializeState, type DemoState } from "./storage";

const valid: DemoState = {
  ...defaultState(),
  profile: {
    alias: "Ana",
    savings: 20000,
    placement: "cont-curent",
    nominalPct: 0,
    monthly: 500,
    years: 10,
    goal: "fond-urgenta",
    ageRange: "26-30",
    isDemo: false,
  },
  assumptions: { inflationPct: 6.5 },
  reality: { years: 10 },
  onboarding: { completedAt: "2026-10-28T10:00:00.000Z" },
  riskProfile: { emergencyFund: "partial", riskTolerance: "medie", experience: "deloc", costlyDebt: "da" },
  progress: {
    visited: { reality: true },
    scams: { curier: { completed: true, correct: 2, total: 3 } },
    modulesRead: { inflatia: true },
    quizzes: { inflatia: { best: 3, total: 4, lastWrong: ["q2"] } },
  },
};

describe("parseState", () => {
  it("returns defaults for null, garbage and wrong versions", () => {
    expect(parseState(null)).toEqual(defaultState());
    expect(parseState("{bad")).toEqual(defaultState());
    expect(parseState(JSON.stringify({ version: 0 }))).toEqual(defaultState());
    expect(parseState("42")).toEqual(defaultState());
  });

  it("round-trips a valid state", () => {
    expect(parseState(serializeState(valid))).toEqual(valid);
  });

  it("drops an invalid profile but keeps valid progress", () => {
    const broken = { ...valid, profile: { ...valid.profile, savings: "mult" } };
    const parsed = parseState(JSON.stringify(broken));
    expect(parsed.profile).toBeNull();
    expect(parsed.progress.modulesRead).toEqual({ inflatia: true });
  });

  it("falls back to the default inflation when out of range", () => {
    const parsed = parseState(JSON.stringify({ ...valid, assumptions: { inflationPct: 999 } }));
    expect(parsed.assumptions.inflationPct).toBe(defaultState().assumptions.inflationPct);
  });

  it("ignores malformed progress entries", () => {
    const parsed = parseState(
      JSON.stringify({
        ...valid,
        progress: { ...valid.progress, quizzes: { a: { best: "x" }, b: { best: 1, total: 2, lastWrong: [] } } },
      }),
    );
    expect(parsed.progress.quizzes).toEqual({ b: { best: 1, total: 2, lastWrong: [] } });
  });

  it("migrates a schema-v1 state, keeping everything and adding the default Reality Check window", () => {
    const profile: Record<string, unknown> = { ...valid.profile };
    delete profile.ageRange;
    const v1: Record<string, unknown> = { ...valid, version: 1, profile };
    delete v1.reality;
    delete v1.onboarding;
    delete v1.riskProfile;
    expect(parseState(JSON.stringify(v1))).toEqual({
      ...valid,
      profile: { ...valid.profile, ageRange: null },
      reality: defaultState().reality,
      onboarding: { completedAt: null },
      riskProfile: defaultState().riskProfile,
    });
  });

  it("migrates a schema-v2 profile without an age range to ageRange: null", () => {
    const profile: Record<string, unknown> = { ...valid.profile };
    delete profile.ageRange;
    const parsed = parseState(JSON.stringify({ ...valid, version: 2, profile }));
    expect(parsed.version).toBe(7);
    expect(parsed.profile?.ageRange).toBeNull();
  });

  it("drops a profile with an unknown age range value", () => {
    expect(parseState(JSON.stringify({ ...valid, profile: { ...valid.profile, ageRange: "40-45" } })).profile).toBeNull();
  });

  it("falls back to the default window when the saved one is not offered", () => {
    for (const years of [4, "5", null]) {
      expect(parseState(JSON.stringify({ ...valid, reality: { years } })).reality.years).toBe(defaultState().reality.years);
    }
  });

  it("migrates a schema-v3 state without onboarding", () => {
    const v3: Record<string, unknown> = { ...valid, version: 3 };
    delete v3.onboarding;
    const parsed = parseState(JSON.stringify(v3));
    expect(parsed.version).toBe(7);
    expect(parsed.onboarding.completedAt).toBeNull();
  });

  it("migrates a schema-v4 state and drops the retired interests list", () => {
    const parsed = parseState(JSON.stringify({ ...valid, version: 4, interests: ["etf"] }));
    expect(parsed).toEqual(valid);
    expect("interests" in parsed).toBe(false);
  });

  it("drops an invalid completion date", () => {
    expect(parseState(JSON.stringify({ ...valid, onboarding: { completedAt: "ieri" } })).onboarding.completedAt).toBeNull();
  });

  it("migrates a schema-v5 state with an empty risk profile and drops invalid answers", () => {
    const v5: Record<string, unknown> = { ...valid, version: 5 };
    delete v5.riskProfile;
    expect(parseState(JSON.stringify(v5)).riskProfile).toEqual({ emergencyFund: null, riskTolerance: null, experience: null, costlyDebt: null });
    const bad = parseState(JSON.stringify({ ...valid, riskProfile: { emergencyFund: "poate", riskTolerance: "medie", experience: 3, costlyDebt: "uneori" } }));
    expect(bad.riskProfile).toEqual({ emergencyFund: null, riskTolerance: "medie", experience: null, costlyDebt: null });
  });

  it("migrates a schema-v6 risk profile without the costly-debt answer", () => {
    const parsed = parseState(JSON.stringify({ ...valid, version: 6, riskProfile: { emergencyFund: "da", riskTolerance: "medie", experience: "deloc" } }));
    expect(parsed.version).toBe(7);
    expect(parsed.riskProfile.costlyDebt).toBeNull();
  });
});
