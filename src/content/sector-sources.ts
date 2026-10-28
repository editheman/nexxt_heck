/**
 * Vetted inputs for the facts pipeline (`npm run facts:build`). Every figure
 * here is a published INS number with its source; nothing is estimated.
 * Sectors without a verified figure get insights computed only from the
 * official CPI / EUR series in `macro-ro.ts` (see `src/lib/facts-builder.ts`).
 *
 * To update: edit the numbers and sources here, run `npm run facts:build`,
 * then `npm test` (fails if `dynamic-facts.json` is out of sync).
 */

export const INS_WAGES_SOURCE = {
  label: "INS, comunicate „Câștigul salarial mediu”",
  url: "https://insse.ro/cms/ro/tags/comunicat-castig-salarial",
};

export const INS_WAGES_OCT_2025 = {
  label: "INS, câștigul salarial mediu, octombrie 2025",
  url: "https://insse.ro/cms/sites/default/files/com_presa/com_pdf/cs10r25.pdf",
};

type Source = { label: string; url: string };
type MonthFigure = { period: string; lei: number; source: Source };

export type SectorInputs = {
  economyNetAnnual: { year: number; lei: number; changePct: number; source: Source };
  economyNetMonth: MonthFigure;
  itNetMonth: MonthFigure;
  horecaNetMonth: MonthFigure;
};

export const SECTOR_INPUTS: SectorInputs = {
  /** Average net wage, whole economy, annual average 2025, lei, and its change vs 2024, %. */
  economyNetAnnual: { year: 2025, lei: 5_266, changePct: 6.2, source: INS_WAGES_SOURCE },
  /** Average net wage, whole economy, October 2025, lei. */
  economyNetMonth: { period: "octombrie 2025", lei: 5_492, source: INS_WAGES_OCT_2025 },
  /** IT services (CAEN: activități de servicii în tehnologia informației), October 2025, lei net. */
  itNetMonth: { period: "octombrie 2025", lei: 11_810, source: INS_WAGES_OCT_2025 },
  /** Hotels and restaurants, October 2025, lei net. */
  horecaNetMonth: { period: "octombrie 2025", lei: 3_396, source: INS_WAGES_OCT_2025 },
};
