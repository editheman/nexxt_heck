/**
 * "What inflation ate" catalog. Prices are rough, illustrative 2025 RON prices
 * (see docs/superpowers/specs/2026-10-28-protejeaza-design.md §3b), not offers or official statistics — the UI labels them so.
 * Tiers are by the purchasing-power loss in lei.
 */

export type EquivalentTier = "sub-500" | "500-5k" | "5k-30k" | "30k-100k" | "peste-100k";

export type Equivalent = {
  id: string;
  tier: EquivalentTier;
  /** Approximate price, RON. */
  priceRon: number;
  /** Singular noun phrase: "1 pachet de țigări". */
  one: string;
  /** Plural noun phrase: "4 pachete de țigări". */
  many: string;
  /** Shown as a share of one item ("3% dintr-o vilă…") instead of a count. */
  fraction?: { label: string };
};

export const TIER_ORDER: EquivalentTier[] = ["sub-500", "500-5k", "5k-30k", "30k-100k", "peste-100k"];

/** Lower bound (inclusive) of each tier, RON. */
export const TIER_MIN: Record<EquivalentTier, number> = {
  "sub-500": 0,
  "500-5k": 500,
  "5k-30k": 5_000,
  "30k-100k": 30_000,
  "peste-100k": 100_000,
};

export const EQUIVALENTS: Equivalent[] = [
  { id: "tigari", tier: "sub-500", priceRon: 28, one: "pachet de țigări", many: "pachete de țigări" },
  { id: "cafea", tier: "sub-500", priceRon: 18, one: "cafea de specialitate", many: "cafele de specialitate" },
  { id: "shaorma", tier: "sub-500", priceRon: 35, one: "shaorma mare", many: "shaorme mari" },

  { id: "benzina", tier: "500-5k", priceRon: 400, one: "plin de benzină", many: "plinuri de benzină" },
  { id: "sala", tier: "500-5k", priceRon: 2_000, one: "abonament anual la sală", many: "abonamente anuale la sală" },
  { id: "festival", tier: "500-5k", priceRon: 1_200, one: "bilet VIP la festival", many: "bilete VIP la festival" },

  { id: "iphone", tier: "5k-30k", priceRon: 6_500, one: "iPhone de ultimă generație", many: "iPhone-uri de ultimă generație" },
  {
    id: "chirie",
    tier: "5k-30k",
    priceRon: 2_500,
    one: "lună de chirie la un 2 camere în Cluj sau București",
    many: "luni de chirie la un 2 camere în Cluj sau București",
  },

  {
    id: "bmw",
    tier: "30k-100k",
    priceRon: 25_000,
    one: "BMW E46 sau Golf second-hand curat",
    many: "BMW-uri E46 sau Golf-uri second-hand curate",
  },
  {
    id: "avans-garsoniera",
    tier: "30k-100k",
    priceRon: 60_000,
    one: "avans pentru creditul unei garsoniere",
    many: "avansuri pentru creditul unei garsoniere",
  },

  { id: "electrica", tier: "peste-100k", priceRon: 180_000, one: "mașină electrică nouă", many: "mașini electrice noi" },
  {
    id: "vila-pipera",
    tier: "peste-100k",
    priceRon: 1_500_000,
    one: "vilă în Pipera",
    many: "vile în Pipera",
    fraction: { label: "dintr-o vilă în Pipera" },
  },
];
