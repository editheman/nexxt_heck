import { describe, expect, it } from "vitest";
import type { Account } from "./auth";
import { COMPARE_YEARS, friendRows, initials, keptPctFor, trendFor } from "./friends";
import { defaultState, type DemoState } from "./storage";

const acct = (id: string, username: string): Account => ({ id, username, salt: "s", hash: "h", iterations: 1, createdAt: "2026-10-29T00:00:00.000Z" });
const person = (savings: number, nominalPct: number, monthly = 0): DemoState => ({
  ...defaultState(),
  profile: { alias: "x", savings, placement: "numerar", nominalPct, monthly, years: 25, goal: "pensie", ageRange: null, isDemo: false },
  assumptions: { inflationPct: 5 },
});

describe("keptPctFor", () => {
  it("is (1+r)^n / (1+i)^n for savings only, over the common horizon", () => {
    expect(COMPARE_YEARS).toBe(10);
    expect(keptPctFor(person(20000, 0))).toBeCloseTo(100 / Math.pow(1.05, 10), 9); // ≈ 61,39%
    expect(keptPctFor(person(20000, 5))).toBeCloseTo(100, 9);
  });
  it("does not depend on the amount", () => {
    expect(keptPctFor(person(1_000, 3))).toBeCloseTo(keptPctFor(person(900_000, 3))!, 9);
  });
  it("is null without a profile or with nothing saved", () => {
    expect(keptPctFor(defaultState())).toBeNull();
    expect(keptPctFor(person(0, 3))).toBeNull();
  });
});

describe("friendRows", () => {
  const accounts = [acct("1", "ana"), acct("2", "Radu Marin"), acct("3", "elena"), acct("4", "ion")];
  const states: Record<string, DemoState> = {
    "1": person(10000, 2),
    "2": person(50000, 6),
    "3": person(80000, 0),
    "4": person(999_999, 7),
  };
  const rows = friendRows(accounts, "1", (id) => states[id]);

  it("puts me first, then friends by % kept", () => {
    expect(rows.map((r) => r.username)).toEqual(["ana", "ion", "Radu Marin", "elena"]);
    expect(rows[0]).toMatchObject({ isMe: true, trend: "Pierde" });
    expect(rows[1].trend).toBe("Crește");
  });
  it("puts friends without a profile last, with no value", () => {
    const r = friendRows([acct("1", "ana"), acct("2", "zoe"), acct("3", "bob")], "1", (id) => (id === "2" ? defaultState() : person(1000, 1)));
    expect(r.map((x) => x.username)).toEqual(["ana", "bob", "zoe"]);
    expect(r[2]).toMatchObject({ keptPct: null, trend: null });
  });
  it("never exposes amounts", () => {
    expect(JSON.stringify(rows)).not.toMatch(/999|50000|80000|10000/);
  });
});

describe("trendFor / initials", () => {
  it("maps % to a trend", () => {
    expect([61, 99.4, 99.6, 100.4, 100.6, 120].map(trendFor)).toEqual(["Pierde", "Pierde", "Păstrează", "Păstrează", "Crește", "Crește"]);
  });
  it("builds initials", () => {
    expect(initials("Radu Marin")).toBe("RM");
    expect(initials("ana")).toBe("AN");
    expect(initials("ion_pop")).toBe("IP");
    expect(initials("ștefan")).toBe("ȘT");
  });
});
