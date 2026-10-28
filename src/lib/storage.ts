import { LIMITS } from "./finance";

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

export type DemoState = {
  version: 1;
  profile: Profile | null;
  assumptions: { inflationPct: number };
  progress: {
    visited: Partial<Record<"reality" | "simulator", true>>;
    scams: Record<string, ScamResult>;
    modulesRead: Record<string, true>;
    quizzes: Record<string, QuizResult>;
  };
};

export function defaultState(): DemoState {
  return {
    version: 1,
    profile: null,
    assumptions: { inflationPct: DEFAULT_INFLATION_PCT },
    progress: { visited: {}, scams: {}, modulesRead: {}, quizzes: {} },
  };
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const inRange = (v: unknown, min: number, max: number): v is number => isNum(v) && v >= min && v <= max;

function parseProfile(v: unknown): Profile | null {
  if (!isObj(v)) return null;
  const { alias, savings, placement, nominalPct, monthly, years, goal, isDemo } = v;
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
  return { alias, savings, placement: placement as Placement, nominalPct, monthly, years, goal: goal as Goal, isDemo };
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

function parseScam(v: unknown): ScamResult | null {
  if (!isObj(v) || v.completed !== true || !isNum(v.correct) || !isNum(v.total)) return null;
  return { completed: true, correct: v.correct, total: v.total };
}

/** Never throws: anything unreadable falls back to defaults, field by field. */
export function parseState(raw: string | null): DemoState {
  const fallback = defaultState();
  if (raw === null) return fallback;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return fallback;
  }
  if (!isObj(data) || data.version !== 1) return fallback;

  const assumptions = isObj(data.assumptions) ? data.assumptions : {};
  const progress = isObj(data.progress) ? data.progress : {};
  const visited = isObj(progress.visited) ? progress.visited : {};

  return {
    version: 1,
    profile: parseProfile(data.profile),
    assumptions: {
      inflationPct: inRange(assumptions.inflationPct, LIMITS.ratePctMin, LIMITS.ratePctMax)
        ? assumptions.inflationPct
        : DEFAULT_INFLATION_PCT,
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
  };
}

export function serializeState(state: DemoState): string {
  return JSON.stringify(state);
}
