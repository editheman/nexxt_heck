/**
 * Deterministic, transparent fit between a user's situation and the product categories.
 * Used as the guardrail and fallback for variant A and as the filter for variant B.
 * Rules are documented in docs/superpowers/specs/2026-10-28-products-design.md.
 */
import { PRODUCT_IDS, type ProductId } from "@/content/products";
import type { DemoState, Goal } from "./storage";

export type EmergencyFund = "da" | "partial" | "nu";
export type RiskTolerance = "scazuta" | "medie" | "ridicata";
export type Experience = "deloc" | "putina" | "multa";

export type FitInput = {
  horizonYears: number;
  goal: Goal;
  emergencyFund: EmergencyFund | null;
  riskTolerance: RiskTolerance | null;
  experience: Experience | null;
};

export type ProductFit = {
  id: ProductId;
  /** Hard guardrail: false means the category should not be suggested for this situation. */
  eligible: boolean;
  /** 0–100, only meaningful for ordering. */
  score: number;
  reasons: string[];
  cautions: string[];
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const years = (n: number) => (n === 1 ? "1 an" : `${n} ani`);

function assess(id: ProductId, i: FitInput): ProductFit {
  const h = i.horizonYears;
  const reasons: string[] = [];
  const cautions: string[] = [];
  let eligible = true;
  let score = 50;
  const plus = (points: number, reason?: string) => {
    score += points;
    if (reason) reasons.push(reason);
  };
  const minus = (points: number, caution?: string) => {
    score -= points;
    if (caution) cautions.push(caution);
  };

  const equityGuard = () => {
    if (h < 5) {
      eligible = false;
      cautions.push(`Orizontul tău de ${years(h)} e prea scurt: acțiunile pot scădea mult pe perioade scurte.`);
    }
    if (i.emergencyFund === "nu") {
      eligible = false;
      cautions.push("Fără fond de urgență, ai putea fi nevoit să vinzi exact când prețul a scăzut.");
    }
    if (i.riskTolerance === "scazuta") {
      eligible = false;
      cautions.push("Ai spus că nu ești confortabil cu scăderi ale valorii; aici ele sunt frecvente.");
    }
    if (i.emergencyFund === null) cautions.push("Nu știm dacă ai fond de urgență — asigură-te că îl ai înainte.");
    if (i.riskTolerance === null) cautions.push("Gândește-te dacă accepți riscul ca valoarea să scadă temporar cu mult.");
  };

  switch (id) {
    case "cont-economii":
      if (i.emergencyFund === "nu") {
        score = 100;
        reasons.push("Nu ai încă un fond de urgență: primul pas este o rezervă disponibilă oricând.");
      } else if (i.emergencyFund === "partial") {
        score += 25;
        reasons.push("Fondul de urgență e doar parțial: merită completat într-un loc lichid.");
      }
      if (h < 1) plus(30, "Ai nevoie de bani în mai puțin de un an: lichiditatea contează cel mai mult.");
      if (i.goal === "fond-urgenta") plus(15, "Obiectivul tău este chiar fondul de urgență.");
      if (h >= 5) minus(20, "Pe termen lung, dobânda unui cont de economii poate rămâne sub inflație.");
      if (reasons.length === 0) reasons.push("Util pentru banii pe care vrei să-i ai la îndemână.");
      break;

    case "depozit":
      if (h <= 3) plus(h === 0 ? 15 : 25, "Ai un orizont scurt și un moment cunoscut în care ai nevoie de bani.");
      if (i.goal === "locuinta" || i.goal === "educatie") plus(10, "Potrivit pentru o sumă planificată pentru o dată anume.");
      if (h >= 7) minus(15, "Pe orizonturi lungi, dobânda depozitelor poate rămâne sub inflație.");
      cautions.push("Retragerea înainte de termen costă de regulă dobânda.");
      if (reasons.length === 0) reasons.push("Garantat de FGDB, cu dobândă stabilită de la început.");
      break;

    case "tezaur":
      if (h < 1) {
        eligible = false;
        cautions.push("Maturitatea minimă este de regulă de un an, iar tu ai nevoie de bani mai devreme.");
      }
      if (h >= 1 && h <= 5) plus(30, `Maturitățile de 1–5 ani se potrivesc orizontului tău de ${years(h)}.`);
      if (i.riskTolerance === "scazuta") plus(10, "Risc foarte scăzut, potrivit preferinței tale pentru siguranță.");
      if (i.goal === "locuinta" || i.goal === "educatie") score += 10;
      if (h > 7) score -= 10;
      reasons.push("Dobânda nu se impozitează.");
      cautions.push("Banii sunt blocați, în principiu, până la scadență.");
      break;

    case "fidelis":
      if (h < 1) {
        eligible = false;
        cautions.push("Orizontul tău este sub un an; emisiunile au maturități mai lungi.");
      }
      if (h >= 1 && h <= 7) plus(25, `Există emisiuni cu maturități potrivite orizontului tău de ${years(h)}.`);
      if (i.experience && i.experience !== "deloc") plus(10, "Ai deja puțină experiență, utilă pentru cumpărarea prin intermediar și bursă.");
      if (i.riskTolerance === "scazuta" || i.riskTolerance === "medie") score += 5;
      reasons.push("Dobânda și câștigul din vânzare nu se impozitează.");
      cautions.push("Dacă vinzi înainte de scadență, prețul de pe bursă poate fi mai mic.");
      break;

    case "etf-bet":
      score = 40;
      equityGuard();
      if (h >= 5) plus(20, "Orizont suficient de lung pentru acțiuni.");
      if (h >= 10) score += 10;
      if (i.riskTolerance === "ridicata") plus(10, "Accepți variații mari ale valorii.");
      if (i.experience === "deloc") minus(10, "Fără experiență, începe cu sume mici și învață întâi modulul despre ETF-uri.");
      cautions.push("Expunere concentrată pe economia României și pe câteva companii mari.");
      break;

    case "etf-global":
      equityGuard();
      if (h >= 7) plus(25, "Orizont lung, potrivit pentru acțiuni diversificate global.");
      if (h >= 15) score += 10;
      if (i.riskTolerance === "ridicata") plus(10, "Accepți variații mari ale valorii.");
      if (i.goal === "pensie") plus(10, "Obiectiv pe termen lung (pensie).");
      if (i.experience === "deloc") minus(10, "Fără experiență, citește întâi modulul despre ETF-uri.");
      cautions.push("Este de obicei în altă monedă: câștigul în lei depinde și de curs.");
      break;

    case "pilon3":
      score = 45;
      if (i.goal !== "pensie" && h < 10) {
        eligible = false;
        cautions.push("Banii se pot retrage, ca regulă, abia după 60 de ani — nu se potrivește unui obiectiv apropiat.");
      }
      if (i.goal === "pensie") plus(30, "Obiectivul tău este pensia.");
      if (h >= 15) score += 10;
      if (i.riskTolerance === "scazuta" || i.riskTolerance === "medie") score += 5;
      reasons.push("Contribuțiile sunt deductibile fiscal în limita a 400 de euro pe an.");
      cautions.push("Banii nu sunt disponibili până la pensie, în afara situațiilor prevăzute de lege.");
      break;
  }

  return { id, eligible, score: clamp(score), reasons, cautions };
}

/** All categories, eligible first, each group by descending score. */
export function assessProducts(input: FitInput): ProductFit[] {
  return PRODUCT_IDS.map((id) => assess(id, input)).sort(
    (a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score,
  );
}

/** The fit input for the current user, or null when there is no profile yet. */
export function fitInputFromState(s: DemoState): FitInput | null {
  if (!s.profile) return null;
  return { horizonYears: s.profile.years, goal: s.profile.goal, ...s.riskProfile };
}
