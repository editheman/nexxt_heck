import { formatLei, formatYears } from "./format";
import type { SimInput, SimSummary } from "./finance";

/** One plain-language sentence describing a projection. Always conditional ("ar"), never a forecast. */
export function explainOutcome(input: SimInput, s: SimSummary): string {
  if (input.years === 0) {
    return "Cu un orizont de 0 ani nu există încă niciun efect al randamentului sau al inflației: valoarea rămâne cea de azi.";
  }
  const horizon = formatYears(input.years);
  const head = `Sub aceste ipoteze, peste ${horizon} ai avea nominal ${formatLei(s.nominal)}, cu puterea de cumpărare a aproximativ ${formatLei(s.real)} de azi`;
  const diff = s.real - s.contributed;
  // Treat differences under 0,05% of the total as "the same" to avoid rounding noise.
  if (Math.abs(diff) <= Math.max(1, s.contributed * 0.0005)) {
    return `${head} — adică aproximativ aceeași putere de cumpărare ca totalul pus deoparte (${formatLei(s.contributed)}).`;
  }
  const word = diff > 0 ? "mai mult" : "mai puțin";
  return `${head} — cu ${formatLei(Math.abs(diff))} ${word} decât totalul pus deoparte (${formatLei(s.contributed)}).`;
}
