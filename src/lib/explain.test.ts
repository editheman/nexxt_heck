import { describe, expect, it } from "vitest";
import { explainOutcome } from "./explain";
import { summarize, type SimInput } from "./finance";

const norm = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");
const base: SimInput = { principal: 10000, monthly: 0, nominalPct: 0, inflationPct: 5, years: 10 };
const say = (i: SimInput) => norm(explainOutcome(i, summarize(i)));

describe("explainOutcome", () => {
  it("baseline: matches the agreed wording with calculated values", () => {
    expect(say({ principal: 39000, monthly: 800, nominalPct: 5, inflationPct: 5, years: 15 })).toBe(
      "Cu un randament anual de 5% și o inflație anuală de 5%, suma acumulată ar ajunge la aproximativ 292.938 lei în 15 ani. " +
        "Aceasta ar avea o putere de cumpărare echivalentă cu aproximativ 140.908 lei de astăzi. " +
        "Randamentul real anual este de 0%, ceea ce înseamnă că economiile nu câștigă putere de cumpărare prin randament. " +
        "Depunerile lunare fixe își pierd treptat din valoarea reală pe măsură ce prețurile cresc: cei 183.000 lei depuși în total valorează aproximativ 140.908 lei de astăzi.",
    );
  });

  it("never presents real value minus nominal contributions as a loss", () => {
    const text = say({ principal: 39000, monthly: 800, nominalPct: 5, inflationPct: 5, years: 15 });
    expect(text).not.toContain("42.092");
    expect(text).not.toMatch(/mai puțin decât totalul/);
  });

  it("negative real return: states the loss against contributions in today's lei", () => {
    const text = say(base);
    expect(text).toContain("aproximativ 10.000 lei în 10 ani");
    expect(text).toContain("aproximativ 6.139 lei de astăzi");
    expect(text).toContain("aproximativ -4,76%");
    expect(text).toContain("ar pierde aproximativ 3.861 lei");
    expect(text).not.toContain("Depunerile lunare");
  });

  it("positive real return: states the gain", () => {
    const text = say({ ...base, nominalPct: 8 });
    expect(text).toContain("aproximativ 2,86%");
    expect(text).toContain("ar câștiga putere de cumpărare");
  });

  it("no inflation: no claim about contributions losing value", () => {
    expect(say({ ...base, monthly: 100, nominalPct: 3, inflationPct: 0 })).not.toContain("Depunerile lunare");
  });

  it("decimal rates are shown with a comma", () => {
    expect(say({ ...base, nominalPct: 5.5, inflationPct: 3.5 })).toContain("randament anual de 5,5% și o inflație anuală de 3,5%");
  });

  it("handles a zero horizon", () => {
    expect(say({ ...base, years: 0 })).toContain("0 ani");
  });
});
