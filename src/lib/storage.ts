import { DEFAULT_REALITY_WINDOW, REALITY_WINDOWS, type RealityWindow } from "@/content/macro-ro";
import { LIMITS } from "./finance";
import { emptyPlans, parsePlans, type Plans } from "./plans";
import type { CostlyDebt, EmergencyFund, Experience, RiskTolerance } from "./productFit";

/** Schema changes bump `DemoState.version`, not the key. */
export const STORAGE_KEY = "pcac:v1";
export const DEFAULT_INFLATION_PCT = 5;

export const PLACEMENTS = ["numerar", "cont-curent", "depozit", "investitii", "mix"] as const;
export type Placement = (typeof PLACEMENTS)[number];

export const GOALS = ["fond-urgenta", "locuinta", "educatie", "pensie", "altul"] as const;
export type Goal = (typeof GOALS)[number];

export const AGE_RANGES = ["20-25", "26-30", "31-35"] as const;
export type AgeRange = (typeof AGE_RANGES)[number];

export type Profile = {
  alias: string;
  /** Current savings, RON. */
  savings: number;
  placement: Placement;
  /** The user's own estimate of the nominal annual return on these savings, %. */
  nominalPct: number;
  /** Planned monthly saving, RON. */
  monthly: number;
  years: number;
  goal: Goal;
  /** Optional, chosen in onboarding step 1; null when not given. */
  ageRange: AgeRange | null;
  /** True when loaded from the fictional example profile. */
  isDemo: boolean;
};

export type QuizResult = { best: number; total: number; lastWrong: string[] };

export const EMERGENCY_FUND = ["da", "partial", "nu"] as const;
export const RISK_TOLERANCE = ["scazuta", "medie", "ridicata"] as const;
export const EXPERIENCE = ["deloc", "putina", "multa"] as const;
export const COSTLY_DEBT = ["da", "nu"] as const;

export type RiskProfile = {
  emergencyFund: EmergencyFund | null;
  riskTolerance: RiskTolerance | null;
  experience: Experience | null;
  costlyDebt: CostlyDebt | null;
};

export type DemoState = {
  version: 9;
  profile: Profile | null;
  /** Guided profiling (profil → Reality Check → simulator) finished. Learning is personalised by `profile.goal`. */
  onboarding: { completedAt: string | null };
  /** Answers used to match product categories; null = not answered. */
  riskProfile: RiskProfile;
  /** „Metodele mele”: saved recommendation sets (stack) and the methods picked from them. */
  plans: Plans;
  /** Simulator only: illustrative, user-editable future inflation. */
  assumptions: { inflationPct: number };
  /** Reality Check: which official history window is shown. */
  reality: { years: RealityWindow };
  progress: {
    visited: Partial<Record<"reality" | "simulator", true>>;
    modulesRead: Record<string, true>;
    quizzes: Record<string, QuizResult>;
  };
};

export function defaultState(): DemoState {
  return {
    version: 9,
    profile: null,
    onboarding: { completedAt: null },
    riskProfile: { emergencyFund: null, riskTolerance: null, experience: null, costlyDebt: null },
    plans: emptyPlans(),
    assumptions: { inflationPct: DEFAULT_INFLATION_PCT },
    reality: { years: DEFAULT_REALITY_WINDOW },
    progress: { visited: {}, modulesRead: {}, quizzes: {} },
  };
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const inRange = (v: unknown, min: number, max: number): v is number => isNum(v) && v >= min && v <= max;

function parseProfile(v: unknown): Profile | null {
  if (!isObj(v)) return null;
  const { alias, savings, placement, nominalPct, monthly, years, goal, isDemo } = v;
  // Schema v1/v2 profiles have no age range: treat missing as "not given".
  const ageRange = v.ageRange === undefined || v.ageRange === null ? null : v.ageRange;
  if (ageRange !== null && !AGE_RANGES.includes(ageRange as AgeRange)) return null;
  if (
    typeof alias !== "string" ||
    alias.length > 40 ||
    !inRange(savings, 0, LIMITS.amountMax) ||
    !PLACEMENTS.includes(placement as Placement) ||
    !inRange(nominalPct, LIMITS.ratePctMin, LIMITS.ratePctMax) ||
    !inRange(monthly, 0, LIMITS.amountMax) ||
    !inRange(years, 0, LIMITS.yearsMax) ||
    !Number.isInteger(years) ||
    !GOALS.includes(goal as Goal) ||
    typeof isDemo !== "boolean"
  )
    return null;
  return {
    alias,
    savings,
    placement: placement as Placement,
    nominalPct,
    monthly,
    years,
    goal: goal as Goal,
    ageRange: ageRange as AgeRange | null,
    isDemo,
  };
}

function filterRecord<T>(v: unknown, parse: (entry: unknown) => T | null): Record<string, T> {
  const out: Record<string, T> = {};
  if (!isObj(v)) return out;
  for (const [key, entry] of Object.entries(v)) {
    const parsed = parse(entry);
    if (parsed !== null) out[key] = parsed;
  }
  return out;
}

const parseTrue = (v: unknown) => (v === true ? (true as const) : null);

function parseQuiz(v: unknown): QuizResult | null {
  if (!isObj(v) || !isNum(v.best) || !isNum(v.total) || !Array.isArray(v.lastWrong)) return null;
  if (!v.lastWrong.every((x) => typeof x === "string")) return null;
  return { best: v.best, total: v.total, lastWrong: v.lastWrong as string[] };
}

/**
 * Never throws: anything unreadable falls back to defaults, field by field.
 * Accepts schema v1 (no `reality`), v2 (no `profile.ageRange`), v3 (no `onboarding`) and v4 (with the
 * retired `interests` list, which is dropped) v5 (no `riskProfile`), v6 (no `riskProfile.costlyDebt`), v7 (no `plans`) and v8 (with the retired scam-scenario progress,
 * which is dropped) and migrates them to v9.
 */
export function parseState(raw: string | null): DemoState {
  const fallback = defaultState();
  if (raw === null) return fallback;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return fallback;
  }
  if (!isObj(data) || ![1, 2, 3, 4, 5, 6, 7, 8, 9].includes(data.version as number)) return fallback;

  const assumptions = isObj(data.assumptions) ? data.assumptions : {};
  const reality = isObj(data.reality) ? data.reality : {};
  const progress = isObj(data.progress) ? data.progress : {};
  const visited = isObj(progress.visited) ? progress.visited : {};

  const onboarding = isObj(data.onboarding) ? data.onboarding : {};
  const completedAt = onboarding.completedAt;
  const risk = isObj(data.riskProfile) ? data.riskProfile : {};
  const pick = <T extends string>(v: unknown, allowed: readonly T[]): T | null => (allowed.includes(v as T) ? (v as T) : null);

  return {
    version: 9,
    profile: parseProfile(data.profile),
    onboarding: {
      completedAt: typeof completedAt === "string" && !Number.isNaN(Date.parse(completedAt)) ? completedAt : null,
    },
    riskProfile: {
      emergencyFund: pick(risk.emergencyFund, EMERGENCY_FUND),
      riskTolerance: pick(risk.riskTolerance, RISK_TOLERANCE),
      experience: pick(risk.experience, EXPERIENCE),
      costlyDebt: pick(risk.costlyDebt, COSTLY_DEBT),
    },
    plans: parsePlans(data.plans),
    assumptions: {
      inflationPct: inRange(assumptions.inflationPct, LIMITS.ratePctMin, LIMITS.ratePctMax)
        ? assumptions.inflationPct
        : DEFAULT_INFLATION_PCT,
    },
    reality: {
      years: REALITY_WINDOWS.includes(reality.years as RealityWindow) ? (reality.years as RealityWindow) : DEFAULT_REALITY_WINDOW,
    },
    progress: {
      visited: {
        ...(visited.reality === true ? { reality: true as const } : {}),
        ...(visited.simulator === true ? { simulator: true as const } : {}),
      },
      modulesRead: filterRecord(progress.modulesRead, parseTrue),
      quizzes: filterRecord(progress.quizzes, parseQuiz),
    },
  };
}

export function serializeState(state: DemoState): string {
  return JSON.stringify(state);
}
