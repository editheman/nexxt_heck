import { describe, expect, it } from "vitest";
import { GOAL_PATHS } from "@/content/goalPaths";
import { MODULE_SLUGS } from "@/content/moduleSlugs";
import { GOALS } from "./storage";
import { modulesForGoal, otherModules } from "./goals";

describe("GOAL_PATHS", () => {
  it.each(GOALS)("%s has an intro and 2–5 existing, unique modules", (goal) => {
    const path = GOAL_PATHS[goal];
    expect(path.intro.length).toBeGreaterThan(20);
    expect(path.modules.length).toBeGreaterThanOrEqual(2);
    expect(path.modules.length).toBeLessThanOrEqual(5);
    expect(new Set(path.modules).size).toBe(path.modules.length);
    for (const slug of path.modules) expect(MODULE_SLUGS).toContain(slug);
  });

  it("gives different goals different learning paths", () => {
    const keys = GOALS.map((g) => GOAL_PATHS[g].modules.join(","));
    expect(new Set(keys).size).toBe(GOALS.length);
  });

  it("points long-term saving to ETF investing and emergency funds to liquidity", () => {
    expect(GOAL_PATHS.pensie.modules).toContain("etf");
    expect(GOAL_PATHS["fond-urgenta"].modules[0]).toBe("lichiditate");
  });
});

describe("modulesForGoal / otherModules", () => {
  it("splits the catalogue into the goal's modules (in path order) and the rest", () => {
    const mine = modulesForGoal("pensie").map((m) => m.slug);
    const rest = otherModules("pensie").map((m) => m.slug);
    expect(mine).toEqual(GOAL_PATHS.pensie.modules);
    expect(rest.some((s) => mine.includes(s))).toBe(false);
    expect(mine.length + rest.length).toBe(MODULE_SLUGS.length);
  });
});
