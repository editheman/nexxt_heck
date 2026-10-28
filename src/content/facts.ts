import { buildFacts, DEFAULT_FACT_INPUTS } from "@/lib/facts-builder";
import { DynamicFactsSchema, type DynamicFacts, type Industry, type IndustryInsight } from "@/lib/schemas/facts";
import { LATEST_DATA_YEAR } from "./macro-ro";
import raw from "./dynamic-facts.json";

/**
 * Validated facts: the build-time JSON when it parses, otherwise the same
 * pipeline run on the static series (so the home page always has content).
 */
export function loadFacts(input: unknown): { facts: DynamicFacts; fromFallback: boolean } {
  const parsed = DynamicFactsSchema.safeParse(input);
  if (parsed.success) return { facts: parsed.data, fromFallback: false };
  return { facts: buildFacts(DEFAULT_FACT_INPUTS, `${LATEST_DATA_YEAR}-12-31`), fromFallback: true };
}

export const FACTS = loadFacts(raw).facts;

export const insightFor = (industry: Industry): IndustryInsight =>
  FACTS.industries.find((i) => i.industry === industry)!;
