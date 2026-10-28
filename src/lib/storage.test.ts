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
    expect(parseState(JSON.stringify(v1))).toEqual({ ...valid, profile: { ...valid.profile, ageRange: null }, reality: defaultState().reality });
  });

  it("migrates a schema-v2 profile without an age range to ageRange: null", () => {
    const profile: Record<string, unknown> = { ...valid.profile };
    delete profile.ageRange;
    const parsed = parseState(JSON.stringify({ ...valid, version: 2, profile }));
    expect(parsed.version).toBe(3);
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
});
