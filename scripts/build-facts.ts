/**
 * Build-time facts ingestion: `npm run facts:build`.
 * Regenerates src/content/dynamic-facts.json from the official series and the
 * vetted inputs in src/content/sector-sources.ts, validated with Zod.
 * Usage: npm run facts:build [-- --date=YYYY-MM-DD]
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildFacts, DEFAULT_FACT_INPUTS } from "../src/lib/facts-builder";

const dateArg = process.argv.find((a) => a.startsWith("--date="))?.slice("--date=".length);
const generatedAt = dateArg ?? new Date().toISOString().slice(0, 10);

const facts = buildFacts(DEFAULT_FACT_INPUTS, generatedAt);
const out = join(import.meta.dirname, "..", "src", "content", "dynamic-facts.json");
writeFileSync(out, `${JSON.stringify(facts, null, 2)}\n`);
console.log(`dynamic-facts.json: ${facts.macroFacts.length} macro facts, ${facts.industries.length} industries (${generatedAt}).`);
