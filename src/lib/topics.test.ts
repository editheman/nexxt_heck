import { describe, expect, it } from "vitest";
import { MODULE_SLUGS } from "@/content/moduleSlugs";
import { TOPICS } from "@/content/topics";
import { recommendedModules } from "./topics";

describe("TOPICS", () => {
  it("has unique ids and every topic points to an existing module", () => {
    expect(new Set(TOPICS.map((t) => t.id)).size).toBe(TOPICS.length);
    for (const t of TOPICS) expect(MODULE_SLUGS).toContain(t.moduleSlug);
  });

  it("offers ETF investing as a topic", () => {
    expect(TOPICS.find((t) => t.id === "etf")?.moduleSlug).toBe("etf");
  });
});

describe("recommendedModules", () => {
  it("follows the order of the chosen interests and ignores unknown ids", () => {
    expect(recommendedModules(["fraude", "etf", "nope"])).toEqual(["fraude", "etf"]);
  });

  it("de-duplicates modules shared by several topics", () => {
    const slugs = recommendedModules(TOPICS.map((t) => t.id));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("is empty without interests", () => {
    expect(recommendedModules([])).toEqual([]);
  });
});
