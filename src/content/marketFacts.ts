/**
 * "Știai că?" facts shown before the demo starts. Every number is computed from the
 * official series in macro-ro.ts (INS CPI, BNR EUR/RON) — never typed by hand — so the
 * facts update with LATEST_DATA_YEAR and stay consistent with the Reality Check.
 */
import { historicalInflation } from "@/lib/finance";
import { formatLei, formatPct } from "@/lib/format";
import { CPI_ANNUAL_INDEX, EUR_RON_ANNUAL_AVG, LATEST_DATA_YEAR } from "./macro-ro";

export type MarketFact = { id: string; headline: string; detail: string; source: "INS" | "BNR"; period: string };

const Y = LATEST_DATA_YEAR;
const rate = (v: number) => v.toLocaleString("ro-RO", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

const lastYear = CPI_ANNUAL_INDEX[Y] - 100;
const five = historicalInflation(100, 5, Y, CPI_ANNUAL_INDEX);
const [peakYear, peakIndex] = Object.entries(CPI_ANNUAL_INDEX).reduce((a, b) => (b[1] > a[1] ? b : a));
const eurBase = EUR_RON_ANNUAL_AVG[five.baseYear];
const eurNow = EUR_RON_ANNUAL_AVG[Y];

export const MARKET_FACTS: MarketFact[] = [
  {
    id: "inflatie-an",
    headline: `În ${Y}, prețurile au crescut în medie cu ${formatPct(lastYear)} față de anul precedent.`,
    detail: `Un coș de cumpărături care costa 100 lei în ${Y - 1} a costat, în medie, aproximativ ${formatLei(CPI_ANNUAL_INDEX[Y])} în ${Y}.`,
    source: "INS",
    period: `media anului ${Y}`,
  },
  {
    id: "inflatie-5-ani",
    headline: `Între ${five.baseYear} și ${Y}, prețurile au crescut cumulat cu ${formatPct(five.cumulativeInflationPct)}.`,
    detail: `100 de lei ținuți fără dobândă din ${five.baseYear} cumpără azi cât cumpărau atunci aproximativ ${formatLei(five.real)}.`,
    source: "INS",
    period: `${five.baseYear}–${Y}`,
  },
  {
    id: "curs-eur",
    headline: `Un euro a costat în medie ${rate(eurNow)} lei în ${Y}, față de ${rate(eurBase)} lei în ${five.baseYear}.`,
    detail: `Leul s-a depreciat cu aproximativ ${formatPct(Math.abs((eurBase / eurNow - 1) * 100))} față de euro în această perioadă.`,
    source: "BNR",
    period: `${five.baseYear} și ${Y}, medii anuale`,
  },
  {
    id: "varf",
    headline: `Cel mai mare salt recent al prețurilor a fost în ${peakYear}: ${formatPct(peakIndex - 100)} într-un singur an.`,
    detail: "Inflația variază mult de la un an la altul — de aceea contează să compari randamentul economiilor cu ea.",
    source: "INS",
    period: `2015–${Y}`,
  },
];
