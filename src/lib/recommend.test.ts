import { describe, expect, it } from "vitest";
import { assessProducts, type FitInput } from "./productFit";
import { anonymize, buildMessages, fallbackRecommendations, parseModelOutput, validateRequest } from "./recommend";

const input: FitInput = { horizonYears: 10, goal: "pensie", emergencyFund: "da", riskTolerance: "medie", experience: "putina" };
const fits = assessProducts(input);
const eligible = fits.filter((f) => f.eligible).map((f) => f.id);

describe("anonymize", () => {
  it("buckets amounts and never includes identity fields", () => {
    const a = anonymize({ ...input, savings: 23_456, monthly: 750, placement: "cont-curent", ageRange: "26-30" });
    expect(a.savings).toBe("10.000–50.000 lei");
    expect(a.monthly).toBe("500–1.000 lei/lună");
    expect(JSON.stringify(a)).not.toMatch(/23456|23\.456|750/);
    expect(Object.keys(a)).not.toContain("alias");
  });
});

describe("buildMessages", () => {
  it("lists only eligible categories and forbids specific products and percentages", () => {
    const msgs = buildMessages(anonymize({ ...input, savings: 1000, monthly: 0, placement: "numerar", ageRange: null }), fits);
    const system = msgs[0].content;
    expect(msgs[0].role).toBe("system");
    expect(system).toMatch(/JSON/);
    expect(system).toMatch(/nu numi fonduri|nu recomanda un produs anume/i);
    const user = msgs[1].content;
    for (const id of eligible) expect(user).toContain(id);
    for (const f of fits.filter((x) => !x.eligible)) expect(user).not.toContain(`"${f.id}"`);
  });
});

describe("parseModelOutput", () => {
  const ok = JSON.stringify({
    recomandari: [
      { id: eligible[0], motiv: "Se potrivește orizontului tău lung.", atentie: "Valoarea poate scădea." },
      { id: eligible[1], motiv: "Diversifici.", atentie: "Costuri." },
    ],
  });

  it("accepts valid JSON, also inside code fences", () => {
    expect(parseModelOutput(ok, eligible)).toHaveLength(2);
    expect(parseModelOutput("```json\n" + ok + "\n```", eligible)?.[0].id).toBe(eligible[0]);
  });

  it("drops unknown, ineligible and duplicate ids and caps the list at four", () => {
    const raw = JSON.stringify({
      recomandari: [
        { id: "crypto", motiv: "x", atentie: "y" },
        { id: eligible[0], motiv: "a", atentie: "b" },
        { id: eligible[0], motiv: "again", atentie: "b" },
        ...eligible.map((id) => ({ id, motiv: "m", atentie: "c" })),
      ],
    });
    const out = parseModelOutput(raw, eligible)!;
    expect(out.map((r) => r.id)).toEqual([...new Set(out.map((r) => r.id))]);
    expect(out.every((r) => eligible.includes(r.id))).toBe(true);
    expect(out.length).toBeLessThanOrEqual(4);
  });

  it("rejects text with percentages or promised returns", () => {
    const raw = JSON.stringify({ recomandari: [{ id: eligible[0], motiv: "Randament garantat de 12% pe an.", atentie: "-" }] });
    expect(parseModelOutput(raw, eligible)).toBeNull();
  });

  it("returns null for garbage so the caller can fall back", () => {
    expect(parseModelOutput("nu știu", eligible)).toBeNull();
    expect(parseModelOutput(JSON.stringify({ recomandari: [] }), eligible)).toBeNull();
  });
});

describe("fallbackRecommendations", () => {
  it("uses the top eligible categories with their reasons", () => {
    const out = fallbackRecommendations(fits);
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThanOrEqual(4);
    expect(out[0].id).toBe(eligible[0]);
    expect(out[0].why.length).toBeGreaterThan(5);
  });
});

describe("validateRequest", () => {
  it("accepts a well-formed request and rejects tampered values", () => {
    const good = { ...input, savings: 1000, monthly: 0, placement: "numerar", ageRange: null };
    expect(validateRequest(good)).not.toBeNull();
    expect(validateRequest({ ...good, horizonYears: -3 })).toBeNull();
    expect(validateRequest({ ...good, goal: "lambo" })).toBeNull();
    expect(validateRequest("x")).toBeNull();
  });
});
