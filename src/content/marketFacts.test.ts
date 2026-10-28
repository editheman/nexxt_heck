import { describe, expect, it } from "vitest";
import { MARKET_FACTS } from "./marketFacts";

describe("MARKET_FACTS", () => {
  it("has several facts, each with a source and period", () => {
    expect(MARKET_FACTS.length).toBeGreaterThanOrEqual(3);
    for (const f of MARKET_FACTS) {
      expect(f.source).toMatch(/INS|BNR/);
      expect(f.period).toMatch(/\d{4}/);
      expect(f.headline.length).toBeGreaterThan(10);
    }
  });

  it("derives its numbers from the official series (no hand-typed figures)", () => {
    const text = MARKET_FACTS.map((f) => `${f.headline} ${f.detail}`).join(" ");
    expect(text).toContain("7,3%"); // INS 2025: 107,32 − 100
    expect(text).toContain("49,6%"); // 2021–2025 cumulative
    expect(text).toContain("5,0415"); // BNR 2025 average
    expect(text).toContain("13,8%"); // highest year in the series: 2022
  });
});
