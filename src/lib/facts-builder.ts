import { EQUIVALENTS } from "@/content/equivalents";
import { CPI_ANNUAL_INDEX, EUR_RON_ANNUAL_AVG, LATEST_DATA_YEAR } from "@/content/macro-ro";
import { SECTOR_INPUTS, type SectorInputs } from "@/content/sector-sources";
import { eurConversion, historicalInflation, wholeUnits } from "./finance";
import { formatCount, formatLei, formatPct } from "./format";
import { DynamicFactsSchema, type DynamicFacts, type IndustryInsight, type MacroFact } from "./schemas/facts";

/**
 * Deterministic facts pipeline: official series + vetted inputs → validated
 * facts. Runs at build time (`scripts/build-facts.ts`) and as the runtime
 * fallback, never per visit and never through an LLM. All numbers in the
 * copy are computed here, so the text cannot drift from the data.
 */

export type FactInputs = {
  cpi: Record<number, number>;
  eur: Record<number, number>;
  dataYear: number;
  sectors: SectorInputs;
};

export const DEFAULT_FACT_INPUTS: FactInputs = {
  cpi: CPI_ANNUAL_INDEX,
  eur: EUR_RON_ANNUAL_AVG,
  dataYear: LATEST_DATA_YEAR,
  sectors: SECTOR_INPUTS,
};

const INS_CPI = { label: "INS, IPC – serie de date anuală", url: "https://insse.ro/cms/ro/content/ipc%E2%80%93serie-de-date-anuala" };
const BNR_FX = { label: "BNR, cursul mediu anual EUR/RON", url: "https://www.bnr.ro" };

/** Window used by the headline facts, matching the Reality Check default. */
const FACT_WINDOW = 5;

const ratio = (v: number) => v.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const rate = (v: number) => v.toLocaleString("ro-RO", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
/** Signed percent with a real minus sign: "−1,0%", "+2,3%". */
const signedPct = (v: number) => `${v < 0 ? "−" : "+"}${formatPct(Math.abs(v))}`;

export function buildFacts(inputs: FactInputs, generatedAt: string): DynamicFacts {
  const { cpi, eur, dataYear: Y, sectors: s } = inputs;
  if (s.economyNetAnnual.year !== Y) throw new Error("Wage data year must match the CPI data year");

  const yearPct = cpi[Y] - 100;
  const yearInfl = formatPct(yearPct, 2);
  const win = historicalInflation(100, FACT_WINDOW, Y, cpi);
  const base = win.baseYear;
  const cum = formatPct(win.cumulativeInflationPct);
  const fx = eurConversion(1, eur[base], eur[Y]);

  const decade = Array.from({ length: 10 }, (_, k) => Y - 9 + k);
  const peak = decade.reduce((a, b) => (cpi[b] > cpi[a] ? b : a));

  const realWagePct = ((1 + s.economyNetAnnual.changePct / 100) / (cpi[Y] / 100) - 1) * 100;
  const realWageVerb = realWagePct < 0 ? "a scăzut" : "a crescut";

  const macroFacts: MacroFact[] = [
    {
      id: `inflatie-${Y}`,
      kicker: `Inflație ${Y}`,
      text: `Prețurile de consum au crescut în medie cu ${yearInfl} în ${Y} față de ${Y - 1}.`,
      sources: [INS_CPI],
    },
    {
      id: `cumulat-${base}-${Y}`,
      kicker: `Din ${base} până în ${Y}`,
      text: `Ce costa 100 lei în ${base} a costat în medie ${formatLei(100 * win.priceFactor)} în ${Y} (+${cum}).`,
      sources: [INS_CPI],
    },
    {
      id: `salariu-real-${Y}`,
      kicker: "Salariul mediu, în termeni reali",
      text: `Salariul mediu net a crescut nominal cu ${formatPct(s.economyNetAnnual.changePct)} în ${Y}, la ${formatLei(s.economyNetAnnual.lei)}, dar prețurile cu ${yearInfl}: puterea lui de cumpărare ${realWageVerb} cu aproximativ ${formatPct(Math.abs(realWagePct))}.`,
      sources: [s.economyNetAnnual.source, INS_CPI],
    },
    {
      id: `euro-${base}-${Y}`,
      kicker: "Leul față de euro",
      text: `Un euro a costat în medie ${rate(eur[base])} lei în ${base} și ${rate(eur[Y])} lei în ${Y}.`,
      sources: [BNR_FX],
    },
    {
      id: `varf-${peak}`,
      kicker: "Anul de vârf",
      text: `${peak} a avut cea mai mare inflație medie din ultimii 10 ani: ${formatPct(cpi[peak] - 100)}.`,
      sources: [INS_CPI],
    },
  ];

  const econ = s.economyNetMonth;
  const coffee = EQUIVALENTS.find((e) => e.id === "cafea")!;
  const horecaLoss = s.horecaNetMonth.lei - s.horecaNetMonth.lei / (cpi[Y] / 100);
  const bonus = 10_000;

  const industries: IndustryInsight[] = [
    {
      industry: "it",
      label: "IT & Tech",
      headline: "Cel mai bine plătit sector din economie. Inflația nu face excepții.",
      stat: { value: formatLei(s.itNetMonth.lei), caption: `salariul mediu net în IT, ${s.itNetMonth.period}` },
      body: `Este de ${ratio(s.itNetMonth.lei / econ.lei)} ori media pe economie (${formatLei(econ.lei)}). Dar prețurile au crescut cu ${cum} între ${base} și ${Y}: ${formatLei(s.itNetMonth.lei)} cumpără azi cât cumpărau ${formatLei(s.itNetMonth.lei / win.priceFactor)} în ${base}.`,
      kind: "official",
      sources: [s.itNetMonth.source, INS_CPI],
    },
    {
      industry: "horeca",
      label: "HoReCa",
      headline: "Tu faci cafeaua de specialitate. Inflația o bea.",
      stat: { value: formatLei(s.horecaNetMonth.lei), caption: `salariul mediu net în hoteluri și restaurante, ${s.horecaNetMonth.period}` },
      body: `Adică ${formatPct((s.horecaNetMonth.lei / econ.lei) * 100, 0)} din media pe economie. Cu inflația de ${yearInfl} din ${Y}, un salariu care nu crește pierde într-un an aproximativ ${formatLei(horecaLoss)} pe lună din puterea de cumpărare — cam ${formatCount(wholeUnits(horecaLoss, coffee.priceRon), coffee.one, coffee.many)} (metaforă, preț orientativ ${formatLei(coffee.priceRon)}).`,
      kind: "official",
      sources: [s.horecaNetMonth.source, INS_CPI],
    },
    {
      industry: "sanatate",
      label: "Sănătate",
      headline: "Ture lungi, majorări — și totuși pe minus în termeni reali?",
      stat: { value: signedPct(realWagePct), caption: `puterea de cumpărare a salariului mediu net pe economie în ${Y}` },
      body: `Salariul mediu net pe economie a crescut nominal cu ${formatPct(s.economyNetAnnual.changePct)} în ${Y}, iar prețurile cu ${yearInfl}. Nu avem aici o cifră INS separată pentru sănătate, așa că folosim media: dacă venitul tău a crescut cu mai puțin de ${yearInfl} în ${Y}, ai pierdut putere de cumpărare.`,
      kind: "estimate",
      sources: [s.economyNetAnnual.source, INS_CPI],
    },
    {
      industry: "corporate",
      label: "Corporate & Servicii",
      headline: "Bonusul care „a rămas la fel” e, de fapt, mai mic.",
      stat: { value: formatLei(bonus * win.priceFactor), caption: `cât ar trebui să fie în ${Y} un bonus de ${formatLei(bonus)} din ${base}, ca să cumpere la fel` },
      body: `Prețurile medii au crescut cu ${cum} între ${base} și ${Y}. O mărire sau un bonus care n-a ținut pasul a pierdut din valoare, chiar dacă cifra din fluturaș arată la fel. Pragul minim doar pentru ${Y}: ${yearInfl}.`,
      kind: "estimate",
      sources: [INS_CPI],
    },
    {
      industry: "constructii",
      label: "Construcții",
      headline: "Materiale în euro, salariu în lei.",
      stat: { value: signedPct(fx.leuChangePct), caption: `leul față de euro, ${base} → ${Y} (curs mediu anual BNR)` },
      body: `Un euro a costat în medie ${rate(eur[base])} lei în ${base} și ${rate(eur[Y])} lei în ${Y}. Tot ce e cotat în euro — utilaje, materiale importate, avansul la un apartament — cere mai mulți lei, iar prețurile în lei au crescut cu ${cum} în aceeași perioadă.`,
      kind: "estimate",
      sources: [BNR_FX, INS_CPI],
    },
    {
      industry: "freelancer",
      label: "Freelancer / Student",
      headline: "Fără grilă de salarizare, indexarea ți-o faci singur.",
      stat: { value: `−${formatPct((1 - 1 / win.priceFactor) * 100)}`, caption: `puterea de cumpărare a unui tarif (sau a unei burse) neschimbat din ${base}` },
      body: `Dacă tariful tău orar sau bursa sunt aceleași ca în ${base}, în ${Y} cumpără cu ${formatPct((1 - 1 / win.priceFactor) * 100)} mai puțin. Doar ca să rămâi pe loc, ar fi trebuit să crească cu ${cum}.`,
      kind: "estimate",
      sources: [INS_CPI],
    },
  ];

  return DynamicFactsSchema.parse({ schemaVersion: 1, generatedAt, dataYear: Y, macroFacts, industries });
}
