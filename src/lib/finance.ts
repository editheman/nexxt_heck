/**
 * Pure financial calculations. No React, no I/O.
 *
 * Conventions (see docs/superpowers/specs/2026-10-28-protejeaza-design.md §3):
 * - Rates are annual effective percentages (5 means 5%/year).
 * - The starting amount compounds annually: P × (1 + r)^n.
 * - Monthly contributions are paid at the END of each month and grow at the
 *   equivalent monthly rate rm = (1 + r)^(1/12) − 1, so 12 months of
 *   compounding equal exactly one year at r.
 * - Purchasing power in today's RON = nominal / (1 + i)^t, t in years.
 * - Historical Reality Check: real = P / ∏(1 + i_t) over official INS annual
 *   average CPI indices (spec §3b); no interest on P.
 */

export type SimInput = {
  /** Starting amount, RON. */
  principal: number;
  /** Contribution at the end of each month, RON. */
  monthly: number;
  /** Assumed nominal annual return, %. */
  nominalPct: number;
  /** Assumed annual inflation, %. */
  inflationPct: number;
  /** Whole years. */
  years: number;
};

export type ProjectionRow = {
  year: number;
  /** Nominal balance (lei at that future date). */
  nominal: number;
  /** Same balance expressed in today's lei. */
  real: number;
  /** Principal + contributions paid so far (no growth). */
  contributed: number;
};

export type SimSummary = {
  nominal: number;
  real: number;
  contributed: number;
  /** nominal − real: how many future lei are "missing" in today's money, under the assumptions. */
  purchasingPowerGap: number;
  realRatePct: number;
};

export const LIMITS = {
  amountMax: 100_000_000,
  ratePctMin: -10,
  ratePctMax: 30,
  yearsMax: 50,
} as const;

export type SimErrors = Partial<Record<keyof SimInput, string>>;

const fmt = (n: number) => n.toLocaleString("ro-RO");

export function validateSimInput(input: SimInput): SimErrors {
  const errors: SimErrors = {};

  for (const key of ["principal", "monthly"] as const) {
    const v = input[key];
    if (!Number.isFinite(v)) errors[key] = "Introdu o sumă validă.";
    else if (v < 0) errors[key] = "Suma nu poate fi negativă.";
    else if (v > LIMITS.amountMax) errors[key] = `Suma maximă acceptată este ${fmt(LIMITS.amountMax)} lei.`;
  }

  for (const key of ["nominalPct", "inflationPct"] as const) {
    const v = input[key];
    if (!Number.isFinite(v)) errors[key] = "Introdu un procent valid.";
    else if (v < LIMITS.ratePctMin || v > LIMITS.ratePctMax)
      errors[key] = `Alege o valoare între ${LIMITS.ratePctMin}% și ${LIMITS.ratePctMax}%.`;
  }

  const y = input.years;
  if (!Number.isFinite(y) || !Number.isInteger(y)) errors.years = "Introdu un număr întreg de ani.";
  else if (y < 0 || y > LIMITS.yearsMax) errors.years = `Alege între 0 și ${LIMITS.yearsMax} de ani.`;

  return errors;
}

function assertValid(input: SimInput) {
  const errors = validateSimInput(input);
  const keys = Object.keys(errors);
  if (keys.length > 0) throw new RangeError(`Invalid simulation input: ${keys.join(", ")}`);
}

/** Exact real rate (Fisher): (1 + r) / (1 + i) − 1, in %. */
export function realRatePct(nominalPct: number, inflationPct: number): number {
  return ((1 + nominalPct / 100) / (1 + inflationPct / 100) - 1) * 100;
}

/** Year-by-year projection, rows for year 0…years inclusive. */
export function project(input: SimInput): ProjectionRow[] {
  assertValid(input);
  const r = input.nominalPct / 100;
  const i = input.inflationPct / 100;
  const rm = Math.pow(1 + r, 1 / 12) - 1;

  const rows: ProjectionRow[] = [];
  for (let year = 0; year <= input.years; year++) {
    const months = year * 12;
    const lump = input.principal * Math.pow(1 + r, year);
    const contributions =
      rm === 0 ? input.monthly * months : (input.monthly * (Math.pow(1 + rm, months) - 1)) / rm;
    const nominal = lump + contributions;
    rows.push({
      year,
      nominal,
      real: nominal / Math.pow(1 + i, year),
      contributed: input.principal + input.monthly * months,
    });
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/* Historical Reality Check (CLAUDE.md §7.B)                           */
/* ------------------------------------------------------------------ */

export type HistoricalResult = {
  /** Year whose average price level is the starting point (first year of the window − 1). */
  baseYear: number;
  endYear: number;
  /** ∏(1 + i_t) over the window. */
  priceFactor: number;
  /** Cumulative price increase, %: (priceFactor − 1) × 100. */
  cumulativeInflationPct: number;
  /** The amount, unchanged in lei. */
  nominal: number;
  /** nominal / priceFactor: what the amount buys, expressed in base-year lei. */
  real: number;
  /** nominal − real. */
  loss: number;
};

/**
 * Purchasing power of `amount` lei kept without interest over the `years`
 * complete years ending at `endYear`, using official annual average CPI indices
 * (previous year = 100). Throws on invalid input or missing data.
 */
export function historicalInflation(
  amount: number,
  years: number,
  endYear: number,
  cpiIndex: Record<number, number>,
): HistoricalResult {
  if (!Number.isFinite(amount) || amount < 0 || amount > LIMITS.amountMax) throw new RangeError("Invalid amount");
  if (!Number.isInteger(years) || years < 1) throw new RangeError("Invalid window");
  let priceFactor = 1;
  for (let y = endYear - years + 1; y <= endYear; y++) {
    const idx = cpiIndex[y];
    if (!Number.isFinite(idx) || idx <= 0) throw new RangeError(`Missing CPI index for ${y}`);
    priceFactor *= idx / 100;
  }
  const real = amount / priceFactor;
  return {
    baseYear: endYear - years,
    endYear,
    priceFactor,
    cumulativeInflationPct: (priceFactor - 1) * 100,
    nominal: amount,
    real,
    loss: amount - real,
  };
}

/** The same lei amount in euro at two annual average EUR/RON rates. */
export function eurConversion(amount: number, rateFrom: number, rateTo: number) {
  if (!(rateFrom > 0) || !(rateTo > 0)) throw new RangeError("Invalid exchange rate");
  return {
    eurFrom: amount / rateFrom,
    eurTo: amount / rateTo,
    /** % change of the leu against the euro; negative = depreciation. */
    leuChangePct: (rateFrom / rateTo - 1) * 100,
  };
}

/** How many whole items of `price` fit into `amount`. Non-positive amounts give 0. */
export function wholeUnits(amount: number, price: number): number {
  if (!(price > 0)) throw new RangeError("Price must be positive");
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.floor(amount / price);
}

export function summarize(input: SimInput): SimSummary {
  const last = project(input).at(-1)!;
  return {
    nominal: last.nominal,
    real: last.real,
    contributed: last.contributed,
    purchasingPowerGap: last.nominal - last.real,
    realRatePct: realRatePct(input.nominalPct, input.inflationPct),
  };
}
