import { formatLei, formatYears } from "./format";
import type { SimInput, SimSummary } from "./finance";

const pct = (v: number) => `${new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2 }).format(Math.abs(v) < 0.005 ? 0 : v)}%`;

/**
 * Plain-language explanation of a projection. Always conditional ("ar"), never a forecast.
 * Compares like with like: the balance in today's lei with the contributions in today's lei —
 * never the inflation-adjusted balance with nominal contributions.
 */
export function explainOutcome(input: SimInput, s: SimSummary): string {
  if (input.years === 0) {
    return "Cu un orizont de 0 ani nu există încă niciun efect al randamentului sau al inflației: valoarea rămâne cea de azi.";
  }
  const parts = [
    `Cu un randament anual de ${pct(input.nominalPct)} și o inflație anuală de ${pct(input.inflationPct)}, suma acumulată ar ajunge la aproximativ ${formatLei(s.nominal)} în ${formatYears(input.years)}.`,
    `Aceasta ar avea o putere de cumpărare echivalentă cu aproximativ ${formatLei(s.real)} de astăzi.`,
  ];
  const real = Math.abs(s.realRatePct) < 0.005 ? 0 : s.realRatePct;
  if (real === 0) {
    parts.push(`Randamentul real anual este de 0%, ceea ce înseamnă că economiile nu câștigă putere de cumpărare prin randament.`);
  } else if (real > 0) {
    parts.push(
      `Randamentul real anual este de aproximativ ${pct(real)}, ceea ce înseamnă că economiile ar câștiga putere de cumpărare prin randament: cu aproximativ ${formatLei(s.real - s.contributedReal)} peste valoarea de astăzi a sumelor depuse.`,
    );
  } else {
    parts.push(
      `Randamentul real anual este de aproximativ ${pct(real)}: randamentul nu ține pasul cu inflația, așa că economiile ar pierde aproximativ ${formatLei(s.contributedReal - s.real)} din valoarea de astăzi a sumelor depuse.`,
    );
  }
  if (input.monthly > 0 && input.inflationPct > 0) {
    parts.push(
      `Depunerile lunare fixe își pierd treptat din valoarea reală pe măsură ce prețurile cresc: cei ${formatLei(s.contributed)} depuși în total valorează aproximativ ${formatLei(s.contributedReal)} de astăzi.`,
    );
  }
  return parts.join(" ");
}
