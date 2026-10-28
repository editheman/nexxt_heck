import { describe, expect, it } from "vitest";
import { EQUIVALENTS, TIER_ORDER } from "@/content/equivalents";
import { pickEquivalents, tierFor } from "./equivalents";

describe("equivalents catalog", () => {
  it("has positive prices, unique ids and items in every tier", () => {
    expect(EQUIVALENTS.every((e) => e.priceRon > 0)).toBe(true);
    expect(new Set(EQUIVALENTS.map((e) => e.id)).size).toBe(EQUIVALENTS.length);
    for (const t of TIER_ORDER) expect(EQUIVALENTS.some((e) => e.tier === t)).toBe(true);
  });
});

describe("tierFor", () => {
  it.each([
    [0, "sub-500"],
    [499.99, "sub-500"],
    [500, "500-5k"],
    [4_999, "500-5k"],
    [5_000, "5k-30k"],
    [30_000, "30k-100k"],
    [100_000, "peste-100k"],
  ] as const)("%d → %s", (loss, tier) => {
    expect(tierFor(loss)).toBe(tier);
  });
});

describe("pickEquivalents", () => {
  it("returns nothing for zero, negative, NaN or too-small losses", () => {
    expect(pickEquivalents(0)).toEqual([]);
    expect(pickEquivalents(-100)).toEqual([]);
    expect(pickEquivalents(Number.NaN)).toEqual([]);
    expect(pickEquivalents(10)).toEqual([]);
  });

  it("small loss: everyday items with floor quantities", () => {
    const picked = pickEquivalents(100);
    expect(picked.map((p) => [p.item.id, p.quantity])).toEqual([
      ["tigari", 3],
      ["cafea", 5],
      ["shaorma", 2],
    ]);
  });

  it("only returns items the loss can actually buy", () => {
    // 25 lei: one coffee only; no lower tier to fill from.
    expect(pickEquivalents(25).map((p) => p.item.id)).toEqual(["cafea"]);
  });

  it("fills from the tier below when a tier has fewer than 2 affordable items", () => {
    // 40.000: BMW (1) only in its tier, the deposit (60.000) is out of reach → add from 5k–30k.
    const ids = pickEquivalents(40_000).map((p) => p.item.id);
    expect(ids[0]).toBe("bmw");
    expect(ids).toContain("iphone");
    expect(ids).not.toContain("avans-garsoniera");
    expect(ids.length).toBeGreaterThanOrEqual(2);
    expect(ids.length).toBeLessThanOrEqual(3);
  });

  it("scales up: big losses use big-ticket items and a share of the villa", () => {
    const picked = pickEquivalents(400_000);
    expect(picked.find((p) => p.item.id === "electrica")?.quantity).toBe(2);
    const vila = picked.find((p) => p.item.id === "vila-pipera");
    expect(vila).toMatchObject({ kind: "fraction", quantity: 26.6 });
  });

  it("quantities grow with the loss", () => {
    const q = (loss: number) => pickEquivalents(loss).find((p) => p.item.id === "iphone")?.quantity;
    expect(q(6_500)).toBe(1);
    expect(q(29_999)).toBe(4);
  });
});
