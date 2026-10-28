/**
 * „Metodele mele”: saved recommendation sets (a stack: newest = current, older = history) and the
 * methods the user picked from them (draft → confirmed). Pure functions; stored in DemoState.
 * See docs/superpowers/specs/2026-10-29-my-methods-design.md.
 */
import { PRODUCT_IDS, type ProductId } from "@/content/products";
import type { Recommendation, RecommendRequest } from "./recommend";

export const HISTORY_CAP = 20;

/** The inputs a set was generated from; a different snapshot means the user was re-profiled. */
export type PlanSnapshot = RecommendRequest;

export type Generation = {
  id: string;
  createdAt: string;
  source: "ai" | "reguli";
  model?: string;
  snapshot: PlanSnapshot;
  items: Recommendation[];
};

export type MethodStatus = "draft" | "confirmed";

export type Method = {
  productId: ProductId;
  generationId: string;
  status: MethodStatus;
  addedAt: string;
  confirmedAt?: string;
};

/** Generations are stored oldest → newest. */
export type Plans = { generations: Generation[]; methods: Method[] };

export const emptyPlans = (): Plans => ({ generations: [], methods: [] });

const SNAPSHOT_KEYS: Array<keyof PlanSnapshot> = [
  "horizonYears", "goal", "placement", "savings", "monthly", "ageRange", "emergencyFund", "riskTolerance", "experience", "costlyDebt",
];

export function sameSnapshot(a: PlanSnapshot, b: PlanSnapshot): boolean {
  return SNAPSHOT_KEYS.every((k) => (a[k] ?? null) === (b[k] ?? null));
}

export const currentGeneration = (p: Plans): Generation | undefined => p.generations.at(-1);

/** Past sets, newest first. */
export const history = (p: Plans): Generation[] => p.generations.slice(0, -1).reverse();

export const methodsOf = (p: Plans, generationId: string): Method[] => p.methods.filter((m) => m.generationId === generationId);

export function addGeneration(
  p: Plans,
  g: { snapshot: PlanSnapshot; items: Recommendation[]; source: "ai" | "reguli"; model?: string },
  now: string,
  id: string,
): Plans {
  const cur = currentGeneration(p);
  if (cur && sameSnapshot(cur.snapshot, g.snapshot)) {
    // Same inputs: refresh the current set; drop its methods that are no longer recommended.
    const ids = new Set(g.items.map((i) => i.id));
    const updated: Generation = { ...cur, createdAt: now, source: g.source, model: g.model, items: g.items };
    return {
      generations: [...p.generations.slice(0, -1), updated],
      methods: p.methods.filter((m) => m.generationId !== cur.id || ids.has(m.productId)),
    };
  }
  const generations = [...p.generations, { id, createdAt: now, source: g.source, model: g.model, snapshot: g.snapshot, items: g.items }];
  const kept = generations.slice(-HISTORY_CAP);
  const keptIds = new Set(kept.map((x) => x.id));
  return { generations: kept, methods: p.methods.filter((m) => keptIds.has(m.generationId)) };
}

const isCurrent = (p: Plans, generationId: string) => currentGeneration(p)?.id === generationId;

/** Adds a draft for a category of the current set, or removes it if it is still a draft. */
export function toggleDraft(p: Plans, productId: ProductId, now: string): Plans {
  const cur = currentGeneration(p);
  if (!cur || !cur.items.some((i) => i.id === productId)) return p;
  const existing = p.methods.find((m) => m.generationId === cur.id && m.productId === productId);
  if (existing?.status === "confirmed") return p;
  if (existing) return { ...p, methods: p.methods.filter((m) => m !== existing) };
  return { ...p, methods: [...p.methods, { productId, generationId: cur.id, status: "draft", addedAt: now }] };
}

function updateCurrent(p: Plans, generationId: string, productId: ProductId, fn: (m: Method) => Method | null): Plans {
  if (!isCurrent(p, generationId)) return p; // history is read-only
  const methods: Method[] = [];
  let changed = false;
  for (const m of p.methods) {
    if (m.generationId === generationId && m.productId === productId) {
      changed = true;
      const next = fn(m);
      if (next) methods.push(next);
    } else methods.push(m);
  }
  return changed ? { ...p, methods } : p;
}

export const confirmMethod = (p: Plans, generationId: string, productId: ProductId, now: string) =>
  updateCurrent(p, generationId, productId, (m) => ({ ...m, status: "confirmed", confirmedAt: now }));

export const unconfirmMethod = (p: Plans, generationId: string, productId: ProductId) =>
  updateCurrent(p, generationId, productId, (m) => ({ productId: m.productId, generationId: m.generationId, status: "draft", addedAt: m.addedAt }));

export const removeMethod = (p: Plans, generationId: string, productId: ProductId) => updateCurrent(p, generationId, productId, () => null);

// ---- Parsing (never throws) ----

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isIso = (v: unknown): v is string => typeof v === "string" && !Number.isNaN(Date.parse(v));
const isProduct = (v: unknown): v is ProductId => PRODUCT_IDS.includes(v as ProductId);

function parseSnapshot(v: unknown): PlanSnapshot | null {
  if (!isObj(v) || typeof v.horizonYears !== "number" || typeof v.savings !== "number" || typeof v.monthly !== "number") return null;
  if (typeof v.goal !== "string" || typeof v.placement !== "string") return null;
  const opt = (x: unknown) => (typeof x === "string" ? x : null);
  return {
    horizonYears: v.horizonYears, savings: v.savings, monthly: v.monthly, goal: v.goal, placement: v.placement,
    ageRange: opt(v.ageRange), emergencyFund: opt(v.emergencyFund), riskTolerance: opt(v.riskTolerance),
    experience: opt(v.experience), costlyDebt: opt(v.costlyDebt),
  } as PlanSnapshot;
}

function parseGeneration(v: unknown): Generation | null {
  if (!isObj(v) || typeof v.id !== "string" || !isIso(v.createdAt) || (v.source !== "ai" && v.source !== "reguli")) return null;
  const snapshot = parseSnapshot(v.snapshot);
  if (!snapshot || !Array.isArray(v.items)) return null;
  const items = v.items
    .filter((i): i is Obj => isObj(i) && isProduct(i.id) && typeof i.why === "string")
    .map((i) => ({ id: i.id as ProductId, why: i.why as string, watchOut: typeof i.watchOut === "string" ? i.watchOut : "" }));
  return { id: v.id, createdAt: v.createdAt, source: v.source, ...(typeof v.model === "string" ? { model: v.model } : {}), snapshot, items };
}

function parseMethod(v: unknown): Method | null {
  if (!isObj(v) || !isProduct(v.productId) || typeof v.generationId !== "string" || !isIso(v.addedAt)) return null;
  if (v.status === "confirmed" && isIso(v.confirmedAt))
    return { productId: v.productId, generationId: v.generationId, status: "confirmed", addedAt: v.addedAt, confirmedAt: v.confirmedAt };
  if (v.status === "draft") return { productId: v.productId, generationId: v.generationId, status: "draft", addedAt: v.addedAt };
  return null;
}

export function parsePlans(v: unknown): Plans {
  if (!isObj(v)) return emptyPlans();
  const generations = (Array.isArray(v.generations) ? v.generations : []).map(parseGeneration).filter((g): g is Generation => g !== null).slice(-HISTORY_CAP);
  const ids = new Set(generations.map((g) => g.id));
  const methods = (Array.isArray(v.methods) ? v.methods : [])
    .map(parseMethod)
    .filter((m): m is Method => m !== null && ids.has(m.generationId));
  return { generations, methods };
}
