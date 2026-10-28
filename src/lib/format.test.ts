import { describe, expect, it } from "vitest";
import { formatCount, formatEur, formatLei, formatPct, formatYears, parseRoNumber, formatIncomeShare } from "./format";

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

describe("formatCount", () => {
  it.each([
    [1, "1 pachet"],
    [2, "2 pachete"],
    [4, "4 pachete"],
    [15, "15 pachete"],
    [19, "19 pachete"],
    [20, "20 de pachete"],
    [101, "101 pachete"],
    [119, "119 pachete"],
    [120, "120 de pachete"],
    [1234, "1.234 de pachete"],
  ])("%i → %s", (n, expected) => {
    expect(formatCount(n, "pachet", "pachete")).toBe(expected);
  });
});

describe("formatEur", () => {
  it("rounds and groups like lei", () => {
    expect(formatEur(4012.4)).toBe("4.012 €");
  });
});

describe("formatIncomeShare", () => {
  it.each([
    [2000, 5000, "40% dintr-un venit net lunar"],
    [10, 5000, "1% dintr-un venit net lunar"],
    [5000, 5000, "1 venit net lunar"],
    [12000, 5000, "2,4 venituri nete lunare"],
    [15000, 5000, "3 venituri nete lunare"],
    [60000, 5000, "12 venituri nete lunare"],
    [105000, 5000, "21 de venituri nete lunare"],
  ])("%d lei / %d lei → %s", (loss, income, expected) => {
    expect(formatIncomeShare(loss, income)).toBe(expected);
  });

  it("is empty without income or loss", () => {
    expect(formatIncomeShare(1000, 0)).toBe("");
    expect(formatIncomeShare(0, 5000)).toBe("");
    expect(formatIncomeShare(-5, 5000)).toBe("");
  });
});
