import { describe, expect, it } from "vitest";
import { computeProgress, isPassed } from "./progress";
import { defaultState } from "./storage";

const catalog = { moduleSlugs: ["a", "b"], scamIds: ["x"] };

describe("computeProgress", () => {
  it("is 0% for a fresh state", () => {
    const p = computeProgress(defaultState(), catalog);
    expect(p.percent).toBe(0);
    expect(p.journey.every((j) => !j.done)).toBe(true);
  });

  it("counts passed quizzes only at ≥ 75%", () => {
    const s = defaultState();
    s.progress.quizzes = { a: { best: 3, total: 4, lastWrong: [] }, b: { best: 2, total: 4, lastWrong: [] } };
    expect(computeProgress(s, catalog).quizzesPassed).toBe(1);
  });

  it("ignores progress for content that no longer exists", () => {
    const s = defaultState();
    s.progress.modulesRead = { a: true, removed: true };
    expect(computeProgress(s, catalog).modulesRead).toBe(1);
  });

  it("reaches 100% when everything is done", () => {
    const s = defaultState();
    s.profile = { alias: "", savings: 1, placement: "numerar", nominalPct: 0, monthly: 0, years: 1, goal: "altul", ageRange: null, isDemo: false };
    s.progress = {
      visited: { reality: true, simulator: true },
      scams: { x: { completed: true, correct: 2, total: 2 } },
      modulesRead: { a: true, b: true },
      quizzes: { a: { best: 4, total: 4, lastWrong: [] }, b: { best: 3, total: 4, lastWrong: [] } },
    };
    s.interests = ["etf"];
    expect(computeProgress(s, catalog).percent).toBe(100);
  });
});

describe("isPassed", () => {
  it("handles an empty quiz", () => expect(isPassed(0, 0)).toBe(false));
});
