import { describe, expect, it } from "vitest";
import { explainOutcome } from "./explain";
import { summarize, type SimInput } from "./finance";

const norm = (s: string) => s.replace(/[  ]/g, " ");
const base: SimInput = { principal: 10000, monthly: 0, nominalPct: 0, inflationPct: 5, years: 10 };
const say = (i: SimInput) => norm(explainOutcome(i, summarize(i)));

describe("explainOutcome", () => {
  it("describes a loss of purchasing power with both amounts", () => {
    const text = say(base);
    expect(text).toContain("10.000 lei");
    expect(text).toContain("6.139 lei");
    expect(text).toContain("mai puțin");
  });

  it("describes a preserved purchasing power when r = i", () => {
    expect(say({ ...base, nominalPct: 5 })).toContain("aproximativ aceeași putere de cumpărare");
  });

  it("describes a gain when r > i", () => {
    expect(say({ ...base, nominalPct: 8 })).toContain("mai mult");
  });

  it("handles a zero horizon", () => {
    expect(say({ ...base, years: 0 })).toContain("0 ani");
  });
});
