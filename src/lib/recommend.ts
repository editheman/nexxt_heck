/**
 * Variant A — category recommendations. Pure helpers shared by the API route and tests:
 * anonymise the input, build the prompt, validate the model's answer against the fit engine's
 * guardrails, and a rule-based fallback. See docs/superpowers/specs/2026-10-28-products-design.md.
 */
import { PRODUCTS, PRODUCT_IDS, type ProductId } from "@/content/products";
import { assessProducts, type FitInput, type ProductFit } from "./productFit";
import { AGE_RANGES, EMERGENCY_FUND, EXPERIENCE, GOALS, PLACEMENTS, RISK_TOLERANCE, type AgeRange, type Placement } from "./storage";

export const MAX_RECOMMENDATIONS = 4;

export type RecommendRequest = FitInput & { savings: number; monthly: number; placement: Placement; ageRange: AgeRange | null };

export type Recommendation = { id: ProductId; why: string; watchOut: string };

export type RecommendResponse = { items: Recommendation[]; source: "ai" | "reguli"; model?: string; fallbackReason?: string };

const LEI = new Intl.NumberFormat("ro-RO");

function bucket(value: number, edges: number[], unit: string): string {
  if (value <= 0) return `0 ${unit}`;
  for (let i = 0; i < edges.length; i++) {
    if (value < edges[i]) return i === 0 ? `sub ${LEI.format(edges[0])} ${unit}` : `${LEI.format(edges[i - 1])}–${LEI.format(edges[i])} ${unit}`;
  }
  return `peste ${LEI.format(edges[edges.length - 1])} ${unit}`;
}

/** What may leave the device: buckets and categories only — never names, emails or exact amounts. */
export function anonymize(r: RecommendRequest) {
  return {
    horizonYears: r.horizonYears,
    goal: r.goal,
    placement: r.placement,
    ageRange: r.ageRange,
    emergencyFund: r.emergencyFund,
    riskTolerance: r.riskTolerance,
    experience: r.experience,
    savings: bucket(r.savings, [1_000, 10_000, 50_000, 200_000], "lei"),
    monthly: bucket(r.monthly, [100, 500, 1_000, 3_000], "lei/lună"),
  };
}

export type ChatMessage = { role: "system" | "user"; content: string };

export function buildMessages(user: ReturnType<typeof anonymize>, fits: ProductFit[]): ChatMessage[] {
  const eligible = fits.filter((f) => f.eligible);
  const catalogue = eligible.map((f) => {
    const p = PRODUCTS.find((x) => x.id === f.id)!;
    return { id: p.id, nume: p.name, ce_este: p.short, risc: p.risk.text, lichiditate: p.liquidity.text, orizont: p.horizon, motive_reguli: f.reasons, atentie_reguli: f.cautions };
  });
  const system = [
    "Ești asistentul educațional al aplicației „Protejează ce ai construit”, pentru adulți din România.",
    "Scopul utilizatorului: să-și păstreze puterea de cumpărare a economiilor față de inflație, în acord cu obiectivul și orizontul lui.",
    `Alege și ordonează cel mult ${MAX_RECOMMENDATIONS} CATEGORII de produse din lista primită, cele mai potrivite situației lui.`,
    "Reguli stricte:",
    "- Folosește doar id-urile din listă. Nu adăuga alte categorii.",
    "- Nu recomanda un produs anume, un fond anume, o bancă sau un broker; nu numi fonduri sau emitenți.",
    "- Nu da cifre: fără procente, dobânzi, randamente, comisioane sau cote de impozit. Nu promite câștiguri.",
    "- Scrie în română corectă, cu diacritice, adresându-te cu „tu”. Maximum două propoziții pe câmp.",
    'Răspunde DOAR cu JSON valid, fără alt text: {"recomandari":[{"id":"…","motiv":"de ce se potrivește situației tale","atentie":"la ce să fii atent"}]}',
  ].join("\n");
  const userMsg = `Situația utilizatorului (anonimizată): ${JSON.stringify(user)}\nCategorii permise (în ordinea regulilor): ${JSON.stringify(catalogue)}`;
  return [
    { role: "system", content: system },
    { role: "user", content: userMsg },
  ];
}

const PERCENT = /\d+([.,]\d+)?\s?%/;
const PROMISE = /\b(garantat\w*\s+de\s+\d|randament(ul)?\s+de\s+\d|câștig\w*\s+sigur)/i;
/** "recomandări" → "recomandari": models trained on Romanian often add diacritics to JSON keys. */
const plainKey = (k: string) => k.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function field(obj: object, name: string): unknown {
  for (const [k, v] of Object.entries(obj)) if (plainKey(k) === name) return v;
  return undefined;
}

const clean = (s: unknown) => (typeof s === "string" ? s.trim().replace(/\s+/g, " ").slice(0, 280) : "");

/** Validated recommendations from the model's text, or null if unusable (caller falls back to rules). */
export function parseModelOutput(text: string, eligible: readonly ProductId[]): Recommendation[] | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let data: unknown;
  try {
    data = JSON.parse(match[0]);
  } catch {
    return null;
  }
  const list = typeof data === "object" && data !== null ? field(data, "recomandari") : undefined;
  if (!Array.isArray(list)) return null;

  const out: Recommendation[] = [];
  for (const item of list) {
    if (typeof item !== "object" || item === null) continue;
    const id = field(item, "id") as ProductId;
    if (!eligible.includes(id) || out.some((r) => r.id === id)) continue;
    const why = clean(field(item, "motiv"));
    const watchOut = clean(field(item, "atentie"));
    if (!why) continue;
    // Any figure or promise means the model ignored the rules: discard the whole answer.
    if (PERCENT.test(why + watchOut) || PROMISE.test(why + watchOut)) return null;
    out.push({ id, why, watchOut });
    if (out.length === MAX_RECOMMENDATIONS) break;
  }
  return out.length > 0 ? out : null;
}

export function fallbackRecommendations(fits: ProductFit[]): Recommendation[] {
  return fits
    .filter((f) => f.eligible)
    .slice(0, MAX_RECOMMENDATIONS)
    .map((f) => ({ id: f.id, why: f.reasons.join(" "), watchOut: f.cautions[0] ?? "" }));
}

/** Server-side validation of the client's request body. */
export function validateRequest(body: unknown): RecommendRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  const num = (v: unknown, max: number) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max;
  const oneOf = <T>(v: unknown, list: readonly T[], nullable = true) => (nullable && v === null) || list.includes(v as T);
  if (!num(b.horizonYears, 50) || !Number.isInteger(b.horizonYears)) return null;
  if (!num(b.savings, 100_000_000) || !num(b.monthly, 100_000_000)) return null;
  if (!oneOf(b.goal, GOALS, false) || !oneOf(b.placement, PLACEMENTS, false)) return null;
  if (!oneOf(b.ageRange, AGE_RANGES) || !oneOf(b.emergencyFund, EMERGENCY_FUND)) return null;
  if (!oneOf(b.riskTolerance, RISK_TOLERANCE) || !oneOf(b.experience, EXPERIENCE)) return null;
  return b as unknown as RecommendRequest;
}

export function rulesFor(req: RecommendRequest) {
  return assessProducts(req);
}

export const ALL_PRODUCT_IDS = PRODUCT_IDS;
