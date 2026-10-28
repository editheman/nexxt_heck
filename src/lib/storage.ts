import { DEFAULT_REALITY_WINDOW, REALITY_WINDOWS, type RealityWindow } from "@/content/macro-ro";
import { LIMITS } from "./finance";
import { INDUSTRIES, type Industry } from "./schemas/facts";

/** LocalStorage key (CLAUDE.md §6). Schema changes bump `DemoState.version`, not the key. */
export const STORAGE_KEY = "pcac:v1";
export const DEFAULT_INFLATION_PCT = 5;

export const PLACEMENTS = ["numerar", "cont-curent", "depozit", "investitii", "mix"] as const;
export type Placement = (typeof PLACEMENTS)[number];

export const GOALS = ["fond-urgenta", "locuinta", "educatie", "pensie", "altul"] as const;
export type Goal = (typeof GOALS)[number];

export type Profile = {
  alias: string;
  /** Current savings, RON. */
  savings: number;
  /** Approximate net monthly income, RON; null when not given. */
  income: number | null;
  placement: Placement;
  /** The user's own estimate of the nominal annual return on these savings, %. */
  nominalPct: number;
  /** Planned monthly saving, RON. */
  monthly: number;
  years: number;
  goal: Goal;
  /** True when loaded from the fictional example profile. */
  isDemo: boolean;
};

export type QuizResult = { best: number; total: number; lastWrong: string[] };
export type ScamResult = { completed: true; correct: number; total: number };

/** A friend's shared educational progress — never any financial figure. */
export type Friend = { alias: string; percent: number; modulesRead: number; quizzesPassed: number; scamsDone: number };

export const ALIAS_MAX = 24;
export const FRIENDS_MAX = 20;

export type DemoState = {
  version: 2;
  /** Chosen on the home page ("În ce domeniu activezi?"). */
  industry: Industry | null;
  profile: Profile | null;
  /** Simulator only: illustrative, user-editable future inflation. */
  assumptions: { inflationPct: number };
  /** Reality Check: which official history window is shown. */
  reality: { years: RealityWindow };
  progress: {
    visited: Partial<Record<"reality" | "simulator", true>>;
    scams: Record<string, ScamResult>;
    modulesRead: Record<string, true>;
    quizzes: Record<string, QuizResult>;
  };
  /** Opt-in: alias shown to friends (null = not opted in) and friends' progress codes. */
  social: { alias: string | null; friends: Friend[] };
};

export function defaultState(): DemoState {
  return {
    version: 2,
    industry: null,
    profile: null,
    assumptions: { inflationPct: DEFAULT_INFLATION_PCT },
    reality: { years: DEFAULT_REALITY_WINDOW },
    progress: { visited: {}, scams: {}, modulesRead: {}, quizzes: {} },
    social: { alias: null, friends: [] },
  };
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const inRange = (v: unknown, min: number, max: number): v is number => isNum(v) && v >= min && v <= max;

function parseProfile(v: unknown): Profile | null {
  if (!isObj(v)) return null;
  const { alias, savings, placement, nominalPct, monthly, years, goal, isDemo } = v;
  // Older states have no income: treat missing as "not given".
  const income = v.income === undefined || v.income === null ? null : v.income;
  if (income !== null && !inRange(income, 0, LIMITS.amountMax)) return null;
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
  return { alias, savings, income, placement: placement as Placement, nominalPct, monthly, years, goal: goal as Goal, isDemo };
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

export function isValidAlias(v: unknown): v is string {
  return typeof v === "string" && v.trim().length >= 2 && v.length <= ALIAS_MAX;
}

export function parseFriend(v: unknown): Friend | null {
  if (!isObj(v) || !isValidAlias(v.alias)) return null;
  const counts = [v.modulesRead, v.quizzesPassed, v.scamsDone];
  if (!inRange(v.percent, 0, 100) || !counts.every((c) => inRange(c, 0, 100) && Number.isInteger(c))) return null;
  return {
    alias: v.alias,
    percent: v.percent,
    modulesRead: v.modulesRead as number,
    quizzesPassed: v.quizzesPassed as number,
    scamsDone: v.scamsDone as number,
  };
}

function parseScam(v: unknown): ScamResult | null {
  if (!isObj(v) || v.completed !== true || !isNum(v.correct) || !isNum(v.total)) return null;
  return { completed: true, correct: v.correct, total: v.total };
}

/**
 * Never throws: anything unreadable falls back to defaults, field by field.
 * Accepts schema v1 (no `reality`, `industry`, `social`, `income`) and migrates it to v2.
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
  if (!isObj(data) || (data.version !== 1 && data.version !== 2)) return fallback;

  const assumptions = isObj(data.assumptions) ? data.assumptions : {};
  const reality = isObj(data.reality) ? data.reality : {};
  const progress = isObj(data.progress) ? data.progress : {};
  const visited = isObj(progress.visited) ? progress.visited : {};
  const social = isObj(data.social) ? data.social : {};

  return {
    version: 2,
    industry: INDUSTRIES.includes(data.industry as Industry) ? (data.industry as Industry) : null,
    profile: parseProfile(data.profile),
    assumptions: {
      inflationPct: inRange(assumptions.inflationPct, LIMITS.ratePctMin, LIMITS.ratePctMax)
        ? assumptions.inflationPct
        : DEFAULT_INFLATION_PCT,
    },
    reality: {
      years: REALITY_WINDOWS.includes(reality.years as RealityWindow)
        ? (reality.years as RealityWindow)
        : DEFAULT_REALITY_WINDOW,
    },
    progress: {
      visited: {
        ...(visited.reality === true ? { reality: true as const } : {}),
        ...(visited.simulator === true ? { simulator: true as const } : {}),
      },
      scams: filterRecord(progress.scams, parseScam),
      modulesRead: filterRecord(progress.modulesRead, parseTrue),
      quizzes: filterRecord(progress.quizzes, parseQuiz),
    },
    social: {
      alias: isValidAlias(social.alias) ? social.alias : null,
      friends: (Array.isArray(social.friends) ? social.friends : [])
        .map(parseFriend)
        .filter((f): f is Friend => f !== null)
        .slice(0, FRIENDS_MAX),
    },
  };
}

/**
 * Profile from the home funnel's two sliders. An existing profile keeps all its
 * other answers; a new one starts from neutral defaults (no interest, no
 * monthly saving) that the user can refine on /profil.
 */
export function quickProfile(base: Profile | null, savings: number, income: number): Profile {
  if (base && !base.isDemo) return { ...base, savings, income };
  return {
    alias: "",
    savings,
    income,
    placement: "cont-curent",
    nominalPct: 0,
    monthly: 0,
    years: 10,
    goal: "fond-urgenta",
    isDemo: false,
  };
}

export function serializeState(state: DemoState): string {
  return JSON.stringify(state);
}
