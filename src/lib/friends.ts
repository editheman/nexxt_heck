/**
 * „Prieteni”: every other account is a friend (owner's decision, 2026-10-29 — no friend requests).
 * Friends are compared only by the % of purchasing power their savings would keep — shown by default
 * in this demo (owner's decision, 2026-10-29). Never amounts, savings, debt or the profile.
 * Accounts are local, so „every account” means the accounts in this browser.
 */
import type { Account } from "./auth";
import { keptPurchasingPowerPct } from "./finance";
import type { DemoState } from "./storage";

/** Same horizon for everyone so the percentages are comparable. */
export const COMPARE_YEARS = 10;

export type Trend = "Crește" | "Păstrează" | "Pierde";

export type FriendRow = {
  id: string;
  username: string;
  initials: string;
  isMe: boolean;
  /** % of purchasing power kept after COMPARE_YEARS; null without a profile. */
  keptPct: number | null;
  trend: Trend | null;
};

export function trendFor(pct: number): Trend {
  if (pct >= 100.5) return "Crește";
  if (pct >= 99.5) return "Păstrează";
  return "Pierde";
}

export function initials(username: string): string {
  const parts = username.trim().split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : username.trim().slice(0, 2);
  return letters.toLocaleUpperCase("ro-RO");
}

/** Own return estimate and inflation assumption, own savings mix, common horizon. */
export function keptPctFor(state: DemoState): number | null {
  const p = state.profile;
  if (!p) return null;
  return keptPurchasingPowerPct({
    principal: p.savings,
    monthly: p.monthly,
    nominalPct: p.nominalPct,
    inflationPct: state.assumptions.inflationPct,
    years: COMPARE_YEARS,
  });
}

/** Me first, then friends by % kept (highest first); those without a profile last, by name. */
export function friendRows(accounts: Account[], meId: string, stateOf: (accountId: string) => DemoState): FriendRow[] {
  const rows = accounts.map((a): FriendRow => {
    const keptPct = keptPctFor(stateOf(a.id));
    return { id: a.id, username: a.username, initials: initials(a.username), isMe: a.id === meId, keptPct, trend: keptPct === null ? null : trendFor(keptPct) };
  });
  const rank = (r: FriendRow) => (r.keptPct === null ? -Infinity : r.keptPct);
  const others = rows.filter((r) => !r.isMe).sort((a, b) => rank(b) - rank(a) || a.username.localeCompare(b.username, "ro"));
  return [...rows.filter((r) => r.isMe), ...others];
}
