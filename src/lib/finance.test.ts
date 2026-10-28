import { describe, expect, it } from "vitest";
import { CPI_ANNUAL_INDEX, EUR_RON_ANNUAL_AVG, LATEST_DATA_YEAR, REALITY_WINDOWS } from "@/content/macro-ro";
import {
  eurConversion,
  historicalInflation,
  project,
  realRatePct,
  summarize,
  validateSimInput,
  wholeUnits,
  type SimInput,
} from "./finance";

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

describe("historicalInflation", () => {
  const cpi = { 2023: 110, 2024: 105, 2025: 100 };

  it("divides by the product of the yearly indices", () => {
    const h = historicalInflation(11_550, 3, 2025, cpi);
    expect(h.baseYear).toBe(2022);
    expect(h.priceFactor).toBeCloseTo(1.1 * 1.05 * 1.0, 12);
    expect(h.real).toBeCloseTo(10_000, 8);
    expect(h.loss).toBeCloseTo(1_550, 8);
    expect(h.cumulativeInflationPct).toBeCloseTo(15.5, 10);
  });

  it("a neutral index (100) changes nothing; deflation gives a negative loss", () => {
    expect(historicalInflation(5000, 1, 2025, cpi).loss).toBe(0);
    expect(historicalInflation(1000, 1, 2016, { 2016: 98.45 }).loss).toBeLessThan(0);
  });

  it("zero savings lose nothing", () => {
    const h = historicalInflation(0, 3, 2025, cpi);
    expect(h.real).toBe(0);
    expect(h.loss).toBe(0);
  });

  it("rejects invalid input and missing years", () => {
    expect(() => historicalInflation(-1, 3, 2025, cpi)).toThrow();
    expect(() => historicalInflation(Number.NaN, 3, 2025, cpi)).toThrow();
    expect(() => historicalInflation(1000, 0, 2025, cpi)).toThrow();
    expect(() => historicalInflation(1000, 2.5, 2025, cpi)).toThrow();
    expect(() => historicalInflation(1000, 4, 2025, cpi)).toThrow(/2022/);
  });

  it("uses official INS data for every offered window", () => {
    for (const n of REALITY_WINDOWS) {
      const h = historicalInflation(10_000, n, LATEST_DATA_YEAR, CPI_ANNUAL_INDEX);
      expect(h.priceFactor).toBeGreaterThan(1);
      expect(EUR_RON_ANNUAL_AVG[h.baseYear]).toBeGreaterThan(0);
    }
    // 2016–2025: 0,9845 · 1,0134 · 1,0463 · 1,0383 · 1,0263 · 1,0505 · 1,138 · 1,104 · 1,0559 · 1,0732
    expect(historicalInflation(10_000, 10, 2025, CPI_ANNUAL_INDEX).priceFactor).toBeCloseTo(1.6636, 4);
    expect(historicalInflation(10_000, 5, 2025, CPI_ANNUAL_INDEX).priceFactor).toBeCloseTo(1.4956, 4);
    expect(historicalInflation(10_000, 3, 2025, CPI_ANNUAL_INDEX).priceFactor).toBeCloseTo(1.251, 4);
  });
});

describe("eurConversion", () => {
  it("converts at both rates and reports the leu change", () => {
    const e = eurConversion(10_000, 4, 5);
    expect(e.eurFrom).toBe(2500);
    expect(e.eurTo).toBe(2000);
    expect(e.leuChangePct).toBeCloseTo(-20, 10);
  });

  it("rejects zero or invalid rates", () => {
    expect(() => eurConversion(100, 0, 5)).toThrow();
    expect(() => eurConversion(100, 5, Number.NaN)).toThrow();
  });
});

describe("wholeUnits", () => {
  it("floors and never divides by zero", () => {
    expect(wholeUnits(99, 28)).toBe(3);
    expect(wholeUnits(28, 28)).toBe(1);
    expect(wholeUnits(27.99, 28)).toBe(0);
    expect(wholeUnits(-50, 28)).toBe(0);
    expect(wholeUnits(Number.NaN, 28)).toBe(0);
    expect(() => wholeUnits(100, 0)).toThrow();
    expect(() => wholeUnits(100, -5)).toThrow();
  });
});
