import { describe, expect, it } from "vitest";
import { decodeFriendCode, encodeFriendCode, friendFromProgress } from "./friends";

const ana = { alias: "Ana-Ștefania", percent: 42, modulesRead: 3, quizzesPassed: 2, scamsDone: 1 };

describe("friend codes", () => {
  it("round-trip, including Romanian diacritics", () => {
    const code = encodeFriendCode(ana);
    expect(code).toMatch(/^PCAC1\.[A-Za-z0-9_-]+$/);
    expect(decodeFriendCode(`  ${code}\n`)).toEqual(ana);
  });

  it("contain only the alias and educational counts", () => {
    const json = atob(encodeFriendCode(ana).slice(6).replace(/-/g, "+").replace(/_/g, "/"));
    expect(Object.keys(JSON.parse(json)).sort()).toEqual(["a", "m", "p", "q", "s"]);
  });

  it("reject garbage, wrong prefixes, extra fields and out-of-range values", () => {
    const enc = (o: unknown) => "PCAC1." + btoa(JSON.stringify(o));
    for (const bad of [
      "",
      "salut",
      "PCAC1.",
      "PCAC1.!!!",
      "PCAC2." + encodeFriendCode(ana).slice(6),
      enc({ a: "Ana", p: 101, m: 0, q: 0, s: 0 }),
      enc({ a: "A", p: 1, m: 0, q: 0, s: 0 }),
      enc({ a: "Ana", p: 1, m: 0, q: 0, s: 0, savings: 20000 }),
      enc({ a: "Ana", p: 1.5, m: 0, q: 0, s: 0 }),
    ])
      expect(decodeFriendCode(bad)).toBeNull();
  });

  it("are built from a progress summary", () => {
    const f = friendFromProgress(" Ana ", { journey: [], modulesRead: 1, quizzesPassed: 0, scamsDone: 2, percent: 20 });
    expect(f).toEqual({ alias: "Ana", percent: 20, modulesRead: 1, quizzesPassed: 0, scamsDone: 2 });
  });
});
