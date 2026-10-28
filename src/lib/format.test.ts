import { describe, expect, it } from "vitest";
import { formatLei, formatPct, formatYears, parseRoNumber } from "./format";

// Intl uses narrow no-break spaces in some locales; normalise for assertions.
const norm = (s: string) => s.replace(/[  ]/g, " ");

describe("formatLei", () => {
  it("uses ro-RO thousands separators and no decimals", () => {
    expect(norm(formatLei(12345.6))).toBe("12.346 lei");
    expect(norm(formatLei(0))).toBe("0 lei");
  });

  it("never prints -0", () => {
    expect(norm(formatLei(-0.2))).toBe("0 lei");
  });
});

describe("formatPct", () => {
  it("uses a decimal comma", () => {
    expect(norm(formatPct(5))).toBe("5,0%");
    expect(norm(formatPct(-4.7619, 2))).toBe("-4,76%");
  });
});

describe("parseRoNumber", () => {
  it.each([
    ["5,5", 5.5],
    ["1.000", 1000],
    ["1.000.000", 1000000],
    ["12.500,75", 12500.75],
    ["5.5", 5.5],
    ["  20 000 lei ", 20000],
    ["7 %", 7],
    ["-3", -3],
    ["0", 0],
  ])("parses %j → %d", (input, expected) => {
    expect(parseRoNumber(input)).toBe(expected);
  });

  it.each(["", "   ", "abc", "1,2,3", "--1", "1.2.3,4,5"])("rejects %j", (input) => {
    expect(parseRoNumber(input)).toBeNull();
  });
});

describe("formatYears", () => {
  it.each([
    [0, "0 ani"],
    [1, "1 an"],
    [2, "2 ani"],
    [10, "10 ani"],
    [19, "19 ani"],
    [20, "20 de ani"],
    [25, "25 de ani"],
    [50, "50 de ani"],
    [101, "101 ani"],
  ])("%d → %s", (n, expected) => {
    expect(formatYears(n)).toBe(expected);
  });
});
