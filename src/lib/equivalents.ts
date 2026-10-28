import { EQUIVALENTS, TIER_MIN, TIER_ORDER, type Equivalent, type EquivalentTier } from "@/content/equivalents";
import { wholeUnits } from "./finance";

export type PickedEquivalent = {
  item: Equivalent;
  /** Whole items (count) — or, for fraction items, the share of one item in % (1 decimal). */
  quantity: number;
  kind: "count" | "fraction";
};

export function tierFor(loss: number): EquivalentTier {
  let tier: EquivalentTier = TIER_ORDER[0];
  for (const t of TIER_ORDER) if (loss >= TIER_MIN[t]) tier = t;
  return tier;
}

function pick(item: Equivalent, loss: number): PickedEquivalent | null {
  if (item.fraction) {
    const pct = Math.floor((loss / item.priceRon) * 1000) / 10;
    // Only meaningful when it is less than one whole item and at least 0,1%.
    return pct >= 0.1 && pct < 100 ? { item, quantity: pct, kind: "fraction" } : null;
  }
  const quantity = wholeUnits(loss, item.priceRon);
  return quantity >= 1 ? { item, quantity, kind: "count" } : null;
}

/**
 * 2–3 tangible equivalents for a purchasing-power loss: items from the loss's
 * tier first, then from lower tiers (largest first) until there are at least 2.
 * Returns [] for a loss that buys nothing (≤ 0 or below the cheapest item).
 */
export function pickEquivalents(loss: number, catalog: Equivalent[] = EQUIVALENTS, max = 3): PickedEquivalent[] {
  if (!Number.isFinite(loss) || loss <= 0) return [];
  const tierIdx = TIER_ORDER.indexOf(tierFor(loss));
  const out: PickedEquivalent[] = [];
  for (let t = tierIdx; t >= 0 && out.length < 2; t--) {
    const inTier = catalog
      .filter((e) => e.tier === TIER_ORDER[t])
      .map((e) => pick(e, loss))
      .filter((p): p is PickedEquivalent => p !== null);
    for (const p of inTier) if (out.length < max) out.push(p);
  }
  return out;
}
