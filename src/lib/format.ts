const leiFormatter = new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 });

/** 12345.6 → "12.346 lei" */
export function formatLei(value: number): string {
  const rounded = Math.round(value);
  return `${leiFormatter.format(rounded === 0 ? 0 : rounded)} lei`;
}

/** 5 → "5,0%" */
export function formatPct(value: number, digits = 1): string {
  const fixed = Number(value.toFixed(digits));
  return `${new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(fixed === 0 ? 0 : fixed)}%`;
}

/** "12.346" → "12.346" without the unit, for inputs. */
export function formatNumberInput(value: number): string {
  return new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2 }).format(value);
}

/**
 * Parses numbers typed the Romanian way and the "programmer" way:
 * "1.000" → 1000, "12.500,75" → 12500.75, "5,5" → 5.5, "5.5" → 5.5.
 * Units ("lei", "%", "ron") and spaces are ignored. Returns null if not a number.
 */
export function parseRoNumber(input: string): number | null {
  let s = input.toLowerCase().replace(/lei|ron|%/g, "").replace(/[\s  ]/g, "");
  if (s === "") return null;

  const negative = s.startsWith("-");
  if (negative) s = s.slice(1);

  if (s.includes(",")) {
    // Comma is the decimal separator; dots are thousands separators.
    if ((s.match(/,/g) ?? []).length > 1) return null;
    const [intPart, frac] = s.split(",");
    if (!/^\d{1,3}(\.\d{3})*$|^\d+$/.test(intPart) || !/^\d+$/.test(frac)) return null;
    s = `${intPart.replace(/\./g, "")}.${frac}`;
  } else if (s.includes(".")) {
    const groups = s.split(".");
    const looksLikeThousands = groups.length > 2 || groups[1].length === 3;
    if (looksLikeThousands) {
      if (!/^\d{1,3}(\.\d{3})+$/.test(s)) return null;
      s = s.replace(/\./g, "");
    } else if (!/^\d+\.\d+$/.test(s)) return null;
  } else if (!/^\d+$/.test(s)) return null;

  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}
