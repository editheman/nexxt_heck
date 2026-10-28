# Product categories — shared base + two variants (A: recommendations, B: map) — Design

Date: 2026-10-28 · Requested by the owner: use the user's data to decide which product categories fit them best, to keep the purchasing power of their capital. Build **two variants on separate branches** so the owner can choose.

## Branches
- `produse-baza` (from `main`): product catalogue with verified facts, the deterministic fit engine, tests. Both variants build on it.
- `produse-recomandari` (variant A): ranked recommendations of **categories** (never a specific fund/issuer) from a prompt to an OpenAI-compatible model (Featherless), validated by the fit engine's guardrails; deterministic ranking when no API key. On this branch only, the CLAUDE.md rule „Do not provide personalized buy/sell recommendations” is replaced by the owner's narrower rule (category-level guidance, no specific product, no guaranteed returns).
- `produse-harta` (variant B): educational map — relevant categories with reasons, comparison of all six, per-category simulator with the user's own rate assumptions, verification checklist. No ranking. CLAUDE.md unchanged.

## Categories
Extended 2026-10-28 at the owner's request to 17, each with a **kind**: `consider` (can be suggested), `caution` (explained with warnings, never suggested: aur, acțiuni individuale, unit-linked, criptomonede), `check` (verify / decision of another scale: Pilonul II, imobiliare). New `consider` categories: rambursarea anticipată a unui credit scump, fonduri deschise (monetare/obligațiuni/mixte), economii în euro, obligațiuni corporative și municipale. New risk question: costly debt (da/nu, no amounts) — `DemoState` v7.

Additional facts (verified 2026-10-28): OUG 50/2010 — no early-repayment compensation on variable-rate consumer loans, capped compensation on fixed-rate ones; MiCA — from 1 July 2026 only authorised crypto-asset service providers may operate in the EU (check the ESMA register; Romanian competent-authority designation was pending in July 2026); Pilon II mandatory for insured persons under 35, fund checked on data.asfromania.ro; investment gold VAT-exempt in the EU; open-ended fund gains taxed with rules changed from 2026 (no rate shown); unit-linked products require a KID and may have very low surrender value in early years.

### Original seven (fixed by the owner)
Cont de economii · Depozit la termen · Titluri de stat Tezaur · Titluri de stat Fidelis · ETF pe indicele BET · ETF global cu acumulare · Fond de pensii facultative (Pilonul III).

## Verified facts used (2026-10-28) — no live rates
- FGDB guarantees deposits up to the lei equivalent of EUR 100 000 per depositor per bank (Law 311/2015; bank depositor information forms).
- Tezaur: for individuals, usual maturities 1/3/5 years, interest not taxed (no income tax, no CASS); subscription via Ghișeul.ro / SPV / Trezorerie; rates change per edition → never shown.
- Fidelis: individuals 18+, lei and euro issues, listed on BVB (can be sold before maturity at market price), interest and capital gains not taxed (BVB press releases).
- ETF BET: e.g. ETF BET Patria-TradeVille (TVBETETF) replicates the BET index (20 largest BVB companies); bought via a broker. Shown as an *example of the category*, not a recommendation.
- Global accumulating ETF: UCITS fund, dividends reinvested, usually in a foreign currency → currency risk; bought via an authorised broker.
- Pilon III: contributions deductible up to EUR 400/year; withdrawal after age 60 (rules recently changed — exact conditions: ASF); administrators authorised and supervised by ASF.
Tax rates, fees and returns are never stated as numbers; the UI links to ANAF / KID / prospectus.

## Fit engine (`src/lib/productFit.ts`, pure, tested)
Input: horizon (profile years), goal, emergency fund (`da | partial | nu | null`), risk tolerance (`scazuta | medie | ridicata | null`), experience.
Per category: `eligible` (hard guardrails) + `score` 0–100 + reasons + cautions.
Guardrails: equity ETFs need horizon ≥ 5 years, an emergency fund that is not „nu”, and tolerance that is not „scazuta”; Tezaur/Fidelis need horizon ≥ 1 year; Pilon III needs goal „pensie” or horizon ≥ 10 years. With no emergency fund, the savings account ranks first.

## Data sent to the model (variant A)
Bucketed and anonymous: horizon, goal, placement type, savings bucket, monthly-saving bucket, age range, emergency fund, tolerance, experience, the Reality Check loss bucket. Never username or email. Key only server-side (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`).

## Tests
Unit: catalogue completeness and sources; guardrails per rule; ordering cases; (A) parsing/validating model output (unknown ids, ineligible ids, duplicates, missing fields → dropped; fallback when empty). E2E per variant without an API key.
