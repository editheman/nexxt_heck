import { describe, expect, it } from "vitest";
import { project, realRatePct, summarize, validateSimInput, type SimInput } from "./finance";

const base: SimInput = { principal: 1000, monthly: 0, nominalPct: 0, inflationPct: 0, years: 0 };

describe("project", () => {
  it("returns only year 0 when years is 0", () => {
    const rows = project(base);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ year: 0, nominal: 1000, real: 1000, contributed: 1000 });
  });

  it("compounds the lump sum annually: P(1+r)^n", () => {
    const rows = project({ ...base, nominalPct: 10, years: 2 });
    expect(rows).toHaveLength(3);
    expect(rows[2].nominal).toBeCloseTo(1210, 9);
  });

  it("deflates by (1+i)^n for purchasing power", () => {
    const last = project({ ...base, inflationPct: 5, years: 10 }).at(-1)!;
    expect(last.nominal).toBe(1000);
    expect(last.real).toBeCloseTo(613.9133, 3);
  });

  it("keeps purchasing power constant when return equals inflation", () => {
    const last = project({ ...base, nominalPct: 7, inflationPct: 7, years: 25 }).at(-1)!;
    expect(last.real).toBeCloseTo(1000, 9);
  });

  it("loses purchasing power when return is below inflation", () => {
    const last = project({ ...base, nominalPct: 2, inflationPct: 5, years: 5 }).at(-1)!;
    expect(last.nominal).toBeGreaterThan(1000);
    expect(last.real).toBeLessThan(1000);
  });

  it("sums monthly contributions linearly at 0%", () => {
    const last = project({ ...base, principal: 0, monthly: 100, years: 1 }).at(-1)!;
    expect(last.nominal).toBeCloseTo(1200, 9);
    expect(last.contributed).toBe(1200);
  });

  it("grows end-of-month contributions at the equivalent monthly rate", () => {
    const last = project({ ...base, principal: 0, monthly: 100, nominalPct: 12, years: 1 }).at(-1)!;
    const rm = Math.pow(1.12, 1 / 12) - 1;
    const expected = (100 * (Math.pow(1 + rm, 12) - 1)) / rm;
    expect(last.nominal).toBeCloseTo(expected, 9);
    expect(last.nominal).toBeCloseTo(1264.65, 2);
  });

  it("handles a negative nominal return", () => {
    const last = project({ ...base, nominalPct: -10, years: 1 }).at(-1)!;
    expect(last.nominal).toBeCloseTo(900, 9);
  });
});

describe("realRatePct", () => {
  it("uses the exact Fisher relation, not r − i", () => {
    expect(realRatePct(10, 5)).toBeCloseTo(4.7619, 4);
    expect(realRatePct(0, 5)).toBeCloseTo(-4.7619, 4);
    expect(realRatePct(5, 5)).toBeCloseTo(0, 12);
  });
});

describe("summarize", () => {
  it("reports the gap between nominal and real value", () => {
    const s = summarize({ ...base, inflationPct: 5, years: 10 });
    expect(s.nominal).toBe(1000);
    expect(s.purchasingPowerGap).toBeCloseTo(1000 - 613.9133, 3);
    expect(s.realRatePct).toBeCloseTo(-4.7619, 4);
  });
});

describe("validateSimInput", () => {
  it("accepts valid input", () => {
    expect(validateSimInput({ ...base, nominalPct: 5, inflationPct: 5, years: 10 })).toEqual({});
  });

  it.each([
    ["years", 2.5],
    ["years", -1],
    ["years", 51],
    ["nominalPct", 31],
    ["inflationPct", -11],
    ["principal", -1],
    ["monthly", Number.NaN],
    ["principal", 100_000_001],
  ] as const)("rejects %s = %s", (key, value) => {
    const errors = validateSimInput({ ...base, [key]: value });
    expect(errors[key]).toBeTypeOf("string");
  });

  it("makes project throw on invalid input instead of returning NaN", () => {
    expect(() => project({ ...base, years: Number.NaN })).toThrow();
  });
});
