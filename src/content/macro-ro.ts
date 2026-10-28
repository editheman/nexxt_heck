/**
 * Official Romanian macro series, stored locally (no live data).
 *
 * CPI: INS „IPC – serie de date anuală”, average annual index, previous year = 100
 * (rata medie anuală a inflației = indice − 100). Source: https://insse.ro/cms/ro/content/ipc%E2%80%93serie-de-date-anuala
 *
 * EUR/RON: BNR annual average = arithmetic mean of the 12 monthly averages of the
 * official daily rates. Only the base years used by the Reality Check windows and
 * the latest year are stored. Source: https://www.bnr.ro
 */

export const LATEST_DATA_YEAR = 2025;

/** INS average annual CPI index (previous year = 100). */
export const CPI_ANNUAL_INDEX: Record<number, number> = {
  2015: 99.41,
  2016: 98.45,
  2017: 101.34,
  2018: 104.63,
  2019: 103.83,
  2020: 102.63,
  2021: 105.05,
  2022: 113.8,
  2023: 110.4,
  2024: 105.59,
  2025: 107.32,
};

/** BNR average annual EUR/RON rate (lei for 1 euro). */
export const EUR_RON_ANNUAL_AVG: Record<number, number> = {
  2015: 4.445,
  2016: 4.4908,
  2020: 4.8371,
  2021: 4.9204,
  2022: 4.9315,
  2023: 4.9465,
  2024: 4.9746,
  2025: 5.0415,
};

/** History windows offered in the Reality Check, in complete years ending at LATEST_DATA_YEAR. */
export const REALITY_WINDOWS = [3, 5, 10] as const;
export type RealityWindow = (typeof REALITY_WINDOWS)[number];
export const DEFAULT_REALITY_WINDOW: RealityWindow = 5;
