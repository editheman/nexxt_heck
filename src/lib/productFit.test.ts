import { describe, expect, it } from "vitest";
import { PRODUCTS, PRODUCT_IDS } from "@/content/products";
import { assessProducts, type FitInput } from "./productFit";

const base: FitInput = { horizonYears: 10, goal: "pensie", emergencyFund: "da", riskTolerance: "medie", experience: "putina", costlyDebt: "nu" };
const byId = (input: FitInput) => Object.fromEntries(assessProducts(input).map((a) => [a.id, a]));

describe("catalogue", () => {
  it("has the seventeen categories, each with a kind, facts, checks and at least one official source", () => {
    expect(PRODUCT_IDS).toHaveLength(17);
    const kinds = PRODUCTS.map((p) => p.kind);
    expect(kinds.filter((k) => k === "consider")).toHaveLength(11);
    expect(kinds.filter((k) => k === "caution")).toHaveLength(4);
    expect(kinds.filter((k) => k === "check")).toHaveLength(2);
    for (const p of PRODUCTS) {
      expect(p.name.length).toBeGreaterThan(3);
      expect(p.what.length).toBeGreaterThan(40);
      expect(p.risk.level).toBeGreaterThanOrEqual(1);
      expect(p.risk.level).toBeLessThanOrEqual(5);
      expect(p.checks.length).toBeGreaterThanOrEqual(2);
      expect(p.sources.length).toBeGreaterThanOrEqual(1);
      for (const s of p.sources) expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it("never states a return or interest rate as a number", () => {
    const text = JSON.stringify(PRODUCTS);
    expect(text).not.toMatch(/\d+([.,]\d+)?\s?%/);
  });
});

describe("assessProducts — guardrails", () => {
  it("excludes equity ETFs for short horizons, low tolerance or no emergency fund", () => {
    for (const input of [
      { ...base, horizonYears: 3 },
      { ...base, riskTolerance: "scazuta" as const },
      { ...base, emergencyFund: "nu" as const },
    ]) {
      const a = byId(input);
      expect(a["etf-bet"].eligible).toBe(false);
      expect(a["etf-global"].eligible).toBe(false);
      expect(a["etf-bet"].cautions.length).toBeGreaterThan(0);
    }
  });

  it("excludes government bonds below one year and Pilon III without a long horizon or pension goal", () => {
    const a = byId({ ...base, horizonYears: 0, goal: "fond-urgenta" });
    expect(a.tezaur.eligible).toBe(false);
    expect(a.fidelis.eligible).toBe(false);
    expect(a.pilon3.eligible).toBe(false);
    expect(a["obligatiuni-corporative"].eligible).toBe(false);
    expect(byId({ ...base, horizonYears: 4, goal: "altul" }).pilon3.eligible).toBe(false);
    expect(byId({ ...base, horizonYears: 12, goal: "altul" }).pilon3.eligible).toBe(true);
  });

  it("keeps the savings account always eligible", () => {
    for (const input of [base, { ...base, horizonYears: 0 }, { ...base, riskTolerance: "ridicata" as const }]) {
      expect(byId(input)["cont-economii"].eligible).toBe(true);
    }
  });
});

describe("assessProducts — new categories", () => {
  it("never recommends 'caution' or 'check' categories, but explains why", () => {
    const a = byId({ ...base, horizonYears: 30, riskTolerance: "ridicata", experience: "multa" });
    for (const id of ["aur", "actiuni", "unit-linked", "cripto", "pilon2", "imobiliare"] as const) {
      expect(a[id].eligible).toBe(false);
      expect(a[id].cautions.length).toBeGreaterThan(0);
    }
  });

  it("puts repaying an expensive loan first when there is one (after a missing emergency fund)", () => {
    expect(assessProducts({ ...base, costlyDebt: "da" })[0].id).toBe("rambursare-credit");
    const both = assessProducts({ ...base, costlyDebt: "da", emergencyFund: "nu" }).map((a) => a.id);
    expect(both.slice(0, 2)).toEqual(["cont-economii", "rambursare-credit"]);
    expect(byId({ ...base, costlyDebt: "nu" })["rambursare-credit"].eligible).toBe(false);
  });

  it("offers money-market/bond funds and euro savings broadly, corporate bonds only with some horizon and tolerance", () => {
    const a = byId({ ...base, horizonYears: 1, riskTolerance: "scazuta" });
    expect(a["fonduri-deschise"].eligible).toBe(true);
    expect(a["economii-euro"].eligible).toBe(true);
    expect(a["obligatiuni-corporative"].eligible).toBe(false);
    expect(byId({ ...base, horizonYears: 3 })["obligatiuni-corporative"].eligible).toBe(true);
  });
});

describe("assessProducts — ordering", () => {
  it("puts the savings account first when there is no emergency fund", () => {
    expect(assessProducts({ ...base, emergencyFund: "nu" })[0].id).toBe("cont-economii");
  });

  it("favours bonds/deposits for a 3-year horizon and long-term categories for retirement", () => {
    const mid = assessProducts({ ...base, horizonYears: 3, goal: "locuinta" }).filter((a) => a.eligible).map((a) => a.id);
    expect(mid.slice(0, 3)).toEqual(expect.arrayContaining(["tezaur", "fidelis"]));
    const longTerm = assessProducts({ ...base, horizonYears: 25, riskTolerance: "ridicata" }).filter((a) => a.eligible).map((a) => a.id);
    expect(longTerm.slice(0, 3)).toEqual(expect.arrayContaining(["etf-global", "pilon3"]));
  });

  it("returns every category once, sorted by eligibility then score, each with reasons", () => {
    const list = assessProducts(base);
    expect(list.map((a) => a.id).sort()).toEqual([...PRODUCT_IDS].sort());
    for (let i = 1; i < list.length; i++) {
      const [prev, cur] = [list[i - 1], list[i]];
      expect(Number(prev.eligible) > Number(cur.eligible) || (prev.eligible === cur.eligible && prev.score >= cur.score)).toBe(true);
    }
    for (const a of list) expect(a.reasons.length + a.cautions.length).toBeGreaterThan(0);
  });

  it("treats unknown answers (null) conservatively", () => {
    const a = byId({ ...base, emergencyFund: null, riskTolerance: null });
    expect(a["etf-global"].eligible).toBe(true);
    expect(a["etf-global"].cautions.join(" ")).toMatch(/risc/i);
  });
});

describe("fitInputFromState", () => {
  it("combines the profile with the risk answers, or returns null without a profile", async () => {
    const { fitInputFromState } = await import("./productFit");
    const { defaultState } = await import("./storage");
    const s = defaultState();
    expect(fitInputFromState(s)).toBeNull();
    s.profile = { alias: "a", savings: 1, placement: "numerar", nominalPct: 0, monthly: 0, years: 7, goal: "pensie", ageRange: null, isDemo: false };
    s.riskProfile = { emergencyFund: "da", riskTolerance: null, experience: "multa", costlyDebt: null };
    expect(fitInputFromState(s)).toEqual({ horizonYears: 7, goal: "pensie", emergencyFund: "da", riskTolerance: null, experience: "multa", costlyDebt: null });
  });
});
