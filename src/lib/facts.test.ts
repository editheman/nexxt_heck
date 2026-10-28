import { describe, expect, it } from "vitest";
import raw from "@/content/dynamic-facts.json";
import { FACTS, insightFor, loadFacts } from "@/content/facts";
import { buildFacts, DEFAULT_FACT_INPUTS } from "./facts-builder";
import { DynamicFactsSchema, INDUSTRIES, MacroFactSchema, RoText } from "./schemas/facts";

describe("facts schema", () => {
  it("accepts the committed dynamic-facts.json", () => {
    expect(DynamicFactsSchema.safeParse(raw).success).toBe(true);
  });

  it("rejects cedilla diacritics and accepts comma-below", () => {
    expect(RoText.safeParse("Prețurile au crescut").success).toBe(true);
    expect(RoText.safeParse("Pre\u0163urile au crescut").success).toBe(false);
    expect(RoText.safeParse("A\u015Fa").success).toBe(false);
  });

  it("rejects empty text, non-https sources and bad ids", () => {
    const ok = { id: "a-1", kicker: "K", text: "T", sources: [{ label: "INS", url: "https://insse.ro" }] };
    expect(MacroFactSchema.safeParse(ok).success).toBe(true);
    expect(MacroFactSchema.safeParse({ ...ok, text: "  " }).success).toBe(false);
    expect(MacroFactSchema.safeParse({ ...ok, sources: [] }).success).toBe(false);
    expect(MacroFactSchema.safeParse({ ...ok, sources: [{ label: "x", url: "http://insse.ro" }] }).success).toBe(false);
    expect(MacroFactSchema.safeParse({ ...ok, id: "Spații" }).success).toBe(false);
  });

  it("requires exactly one insight per industry", () => {
    const facts = buildFacts(DEFAULT_FACT_INPUTS, "2026-10-28");
    expect(DynamicFactsSchema.safeParse({ ...facts, industries: facts.industries.slice(1) }).success).toBe(false);
    expect(DynamicFactsSchema.safeParse({ ...facts, industries: [...facts.industries, facts.industries[0]] }).success).toBe(false);
  });
});

describe("facts pipeline", () => {
  it("committed JSON is in sync with the builder (run `npm run facts:build` after changing inputs)", () => {
    expect(raw).toEqual(buildFacts(DEFAULT_FACT_INPUTS, raw.generatedAt));
  });

  it("computes the headline numbers from the official series", () => {
    const f = buildFacts(DEFAULT_FACT_INPUTS, "2026-10-28");
    const text = (id: string) => f.macroFacts.find((m) => m.id === id)!.text;
    expect(text("inflatie-2025")).toContain("7,32%");
    // 1,0505 · 1,138 · 1,104 · 1,0559 · 1,0732 = 1,4956…
    expect(text("cumulat-2020-2025")).toContain("150 lei în 2025 (+49,6%)");
    // 1,062 / 1,0732 − 1 = −1,04%
    expect(text("salariu-real-2025")).toContain("a scăzut cu aproximativ 1,0%");
    expect(text("varf-2022")).toContain("13,8%");
  });

  it("says 'a crescut' when wages beat inflation", () => {
    const sectors = { ...DEFAULT_FACT_INPUTS.sectors, economyNetAnnual: { ...DEFAULT_FACT_INPUTS.sectors.economyNetAnnual, changePct: 10 } };
    const f = buildFacts({ ...DEFAULT_FACT_INPUTS, sectors }, "2026-10-28");
    expect(f.macroFacts.find((m) => m.id === "salariu-real-2025")!.text).toContain("a crescut cu aproximativ 2,5%");
  });

  it("refuses mismatched wage and CPI years", () => {
    expect(() => buildFacts({ ...DEFAULT_FACT_INPUTS, dataYear: 2024 }, "2026-10-28")).toThrow();
  });

  it("uses Romanian plurals in the HoReCa metaphor", () => {
    expect(insightFor("horeca").body).toContain("12 cafele de specialitate");
  });
});

describe("loadFacts", () => {
  it("falls back to the static pipeline when the JSON is invalid or missing", () => {
    for (const bad of [null, {}, { ...raw, schemaVersion: 2 }, { ...raw, macroFacts: [] }]) {
      const { facts, fromFallback } = loadFacts(bad);
      expect(fromFallback).toBe(true);
      expect(facts.industries.map((i) => i.industry).sort()).toEqual([...INDUSTRIES].sort());
    }
  });

  it("uses the JSON when valid", () => {
    expect(loadFacts(raw).fromFallback).toBe(false);
    expect(FACTS.generatedAt).toBe(raw.generatedAt);
  });
});
