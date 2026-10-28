import { describe, expect, it } from "vitest";
import { defaultState, parseState, quickProfile, serializeState, STORAGE_KEY, type DemoState } from "./storage";

const valid: DemoState = {
  ...defaultState(),
  industry: "horeca",
  profile: {
    alias: "Ana",
    savings: 20000,
    income: 6000,
    placement: "cont-curent",
    nominalPct: 0,
    monthly: 500,
    years: 10,
    goal: "fond-urgenta",
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
  social: { alias: "Ana", friends: [{ alias: "Mihai", percent: 40, modulesRead: 2, quizzesPassed: 1, scamsDone: 1 }] },
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

  it("persists under the pcac:v1 key required by CLAUDE.md", () => {
    expect(STORAGE_KEY).toBe("pcac:v1");
  });

  it("migrates a schema-v1 state, keeping everything and filling new fields with defaults", () => {
    const oldProfile: Record<string, unknown> = { ...valid.profile };
    delete oldProfile.income;
    const v1: Record<string, unknown> = { ...valid, version: 1, profile: oldProfile };
    delete v1.reality;
    delete v1.industry;
    delete v1.social;
    const parsed = parseState(JSON.stringify(v1));
    const d = defaultState();
    expect(parsed).toEqual({ ...valid, profile: { ...valid.profile, income: null }, reality: d.reality, industry: null, social: d.social });
  });

  it("drops an unknown industry, invalid aliases and friends carrying bad data", () => {
    const parsed = parseState(
      JSON.stringify({
        ...valid,
        industry: "banking",
        social: { alias: "x", friends: [{ alias: "Ok", percent: 500, modulesRead: 0, quizzesPassed: 0, scamsDone: 0 }, valid.social.friends[0]] },
      }),
    );
    expect(parsed.industry).toBeNull();
    expect(parsed.social).toEqual({ alias: null, friends: valid.social.friends });
  });

  it("rejects a negative income", () => {
    expect(parseState(JSON.stringify({ ...valid, profile: { ...valid.profile, income: -1 } })).profile).toBeNull();
  });

  it("falls back to the default window when the saved one is not offered", () => {
    for (const years of [4, "5", null]) {
      const parsed = parseState(JSON.stringify({ ...valid, reality: { years } }));
      expect(parsed.reality.years).toBe(defaultState().reality.years);
    }
  });
});

describe("quickProfile", () => {
  it("keeps the other answers of an existing profile", () => {
    expect(quickProfile(valid.profile, 1000, 4000)).toEqual({ ...valid.profile, savings: 1000, income: 4000 });
  });

  it("starts a neutral, non-demo profile otherwise (and replaces the demo one)", () => {
    for (const base of [null, { ...valid.profile!, isDemo: true }]) {
      const p = quickProfile(base, 15000, 5000);
      expect(p).toMatchObject({ savings: 15000, income: 5000, nominalPct: 0, monthly: 0, isDemo: false, alias: "" });
    }
  });
});
