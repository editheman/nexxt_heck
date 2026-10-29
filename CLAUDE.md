# CLAUDE.md — Protejează ce ai construit

## 1. Project Overview

Build a polished, functional financial education web application for Romania called "Llamora" (brand name chosen by the owner, 2026-10-29), with the tagline "Protejează ce ai construit".

Core promise:
"Învață să-ți protejezi banii, să recunoști fraudele și să înțelegi riscurile înainte să iei o decizie financiară."

Target audience:
Romanian adults aged 20–35 who want to protect their savings, understand inflation and financial risks, and recognize scams.

Position Llamora as a tool that helps people protect their money and make informed decisions — not as „just a financial-education platform” (owner's decision, 2026-10-29). It is still not a bank, broker, investment advisor, or trading platform; keep the „nu este consultanță de investiții autorizată” disclaimer on recommendations.

## 2. Working Principles

- Inspect the existing repository before making changes.
- Do not start implementation before understanding the requirements and producing a plan.
- Use the installed Superpowers workflow and relevant skills when applicable.
- For UI/UX tasks, use the installed UI UX Pro Max skill and its design-system workflow.
- Do not skip planning, testing, or verification to produce code faster.
- Implement in small, coherent, verifiable steps.
- Ask for clarification when a consequential product decision cannot be inferred safely.
- Do not overwrite existing work without inspecting it first.
- Explain important architectural decisions and trade-offs.
- Never claim a feature works without testing it.

## 3. Product Priorities

Prioritize the following end-to-end user journey:

1. Enter the demo.
2. Complete a minimal financial profile.
3. View the Reality Check.
4. Change assumptions and explore purchasing power.
5. ~~Complete an interactive financial scam scenario.~~ Removed at the owner's request (2026-10-29); fraud awareness stays as the „fraude” learning module.
6. Study a learning module.
7. Complete a quiz and receive useful feedback.
8. Refresh the page and confirm progress persists.
9. Explore privacy-safe educational progress comparisons.

Core modules:

- Reality Check: financial profile and purchasing-power analysis.
- Scenario Simulator: nominal balances versus real purchasing power.
- Learning Roadmap: inflation, returns, liquidity, diversification, fees, taxes and fraud awareness.
- ~~Scam Awareness (interactive scenarios)~~: removed at the owner's request (2026-10-29); do not re-add `/fraude` without asking.
- Adaptive Quiz: answer-level feedback and concept-specific revision.
- Progress: persistent learning progress and completed modules.
- Friends: opt-in, alias-based educational comparisons.

Build a complete core journey before adding secondary features.

## 4. Financial Accuracy and Safety

- Clearly distinguish user-provided data, illustrative examples, assumptions and calculated estimates.
- Never invent live market data, interest rates, fees, taxes or regulatory verification.
- Never present hypothetical returns as forecasts or guarantees.
- Never claim that inflation caused an exact personal financial loss unless the calculation and its assumptions support that claim.
- Show nominal amounts and purchasing power in today's RON separately.
- Explain the assumptions used in all financial calculations.
- Category-level recommendations are allowed (variant A, owner's decision 2026-10-28): which types of products fit the user's goal, horizon and risk answers, with reasons and risks. Never recommend a specific fund, issuer, bank or broker, never promise returns, never state rates as current facts, and never execute financial transactions. Recommendations must pass the fit engine's guardrails (`src/lib/productFit.ts`) and carry the „nu este consultanță de investiții autorizată” disclaimer.
- Do not request CNPs, bank credentials, account numbers or unnecessary sensitive information.
- Never expose a user's income, savings, debt or financial profile through social features.
- Clearly label demo and fictional data.
- Use verified official sources when making specific claims about Romanian financial regulation or fraud warnings.

## 5. UX and Visual Design

- All user-facing product content must be in Romanian, with correct diacritics.
- Use a calm, premium, trustworthy fintech aesthetic.
- Prioritize clarity, confidence, accessibility and financial comprehension over visual novelty.
- Avoid generic dashboard templates, trading-terminal aesthetics and unnecessary gradients.
- Use consistent typography, spacing, colors, component states and interaction patterns.
- Make the interface responsive and keyboard accessible.
- Include useful loading, empty, error, success and validation states.
- Use clear language for financial concepts and explain technical terms.
- Every visible interactive control must perform its advertised action.
- Do not use fake testimonials, fabricated statistics or unsupported trust badges.

Use UI UX Pro Max to research and establish a coherent design system before implementing the main interface. Record the resulting decisions in project documentation or design tokens so they remain consistent.

## 6. Technical Principles

Preferred stack, unless repository constraints justify another choice:

- Next.js App Router
- TypeScript with strict type checking
- Tailwind CSS
- shadcn/ui where appropriate
- Recharts for meaningful financial visualizations
- LocalStorage for the initial demo's profile and progress persistence

Inspect the repository before selecting or changing dependencies.

- Keep financial calculations in testable, separate functions.
- Validate user inputs and handle edge cases.
- Keep components focused and reusable.
- Avoid unnecessary dependencies and premature abstractions.
- Do not require external API keys or paid services for the core demo.
- Never expose secrets in client-side code.
- Keep business logic separate from presentation.
- Use semantic HTML and accessible form controls.

## 7. Financial Calculation Requirements

For a starting amount P, annual nominal return r, annual inflation i, and n years:

Nominal future value:
P × (1 + r)^n

Real future value in today's purchasing power:
Nominal future value / (1 + i)^n

Document the compounding convention and assumptions.

If monthly contributions are implemented, document their timing and calculate them consistently. Test zero rates, zero years, invalid inputs, and boundary cases.

Do not silently treat nominal returns as real returns.

## 8. Testing and Quality

- Run available linting, type checking, tests and production builds.
- Add unit tests for financial formulas and important edge cases.
- Test the primary journey from onboarding to persistent progress.
- Verify that changing an assumption updates the relevant calculations and visualizations.
- Verify quiz feedback and concept-specific revision.
- Verify that refreshing the page preserves the expected demo state.
- Verify responsive behavior and important accessibility requirements.
- Check for broken navigation, inert controls, console errors and misleading financial labels.
- Report any tests that could not be run and why.

## 9. Definition of Done

A feature is complete only when:

1. Its behavior matches the agreed requirements.
2. Its UI follows the established design system.
3. Inputs and edge cases are handled.
4. The feature works on relevant screen sizes.
5. Relevant tests and verification have been performed.
6. Its financial meaning and limitations are communicated clearly where applicable.
7. It does not break the existing primary journey.

## 10. Communication

Before implementation, explain the proposed approach and important assumptions.

For substantial work, create a written implementation plan with small, ordered tasks and explicit verification steps.

After implementation, summarize what changed, which tests were run, their results, and any remaining limitations.

Prefer a working, coherent end-to-end product over a large collection of incomplete features.
## 11. Project Map

- Design system (tokens, components, anti-patterns): `docs/design-system.md`. Tokens live in `src/app/globals.css`; never use raw hex in components.
- Product/technical spec: `docs/superpowers/specs/2026-10-28-protejeaza-design.md`. Implementation plan: `docs/superpowers/plans/`.
- Financial math lives only in `src/lib/finance.ts` (annual effective rates, end-of-month contributions at `(1+r)^(1/12)−1`). Change conventions there and in the spec together.
- Romanian content (modules, quizzes) is typed data in `src/content/`. Use comma-below ș/ț; a unit test rejects cedilla ş/ţ.
- Demo state is one versioned object in localStorage (`pcac:v1`, `src/lib/storage.ts`). Bump the version and add parsing for any shape change; parsing must never throw.
- This is Next.js 16 with Cache Components: read `node_modules/next/dist/docs/` before using unfamiliar APIs (see `AGENTS.md`).
- Checks: `npm run verify` (lint, typecheck, unit tests, build) and `npm run test:e2e` (Playwright, desktop + mobile).
- Newsletter/email capture was **removed from the UI** at the owner's request (2026-10-29): no article prompt, Progress card, onboarding e-mail field or `/dezabonare`. `src/lib/newsletter.ts` / `useNewsletter.ts` remain only so „Resetează demo-ul” and account sign-up still clear or move data saved earlier; `docs/newsletter.md` keeps the requirements if it returns. Do not ask for e-mail addresses.
- Reality Check is historical and read-only: official INS CPI and BNR EUR/RON series live only in `src/content/macro-ro.ts` (cite source and period in the UI; update `LATEST_DATA_YEAR` and tests together). Future-inflation assumptions belong only in the simulator.
- Guided profiling is profil → Reality Check → simulator → `/portal` (`onboarding.completedAt` in `DemoState`). After it, pages are reached from the portal, not chained; Învață is a portal option. Learning is personalised by `profile.goal` via `src/content/goalPaths.ts` (every goal → existing modules). The „account” is the local demo profile — there is no backend.
- Accounts are **local demo accounts** (`src/lib/auth.ts`, `src/lib/useAuth.ts`): PBKDF2-SHA-256 hash + salt only, never the password; per-account storage keys `pcac:acct:<id>:…`; guest data moves into a new account at sign-up. Never describe them as secure server accounts. Production requirements: `docs/superpowers/specs/2026-10-28-accounts-design.md`.
- Product categories: verified catalogue in `src/content/products.ts` (no numeric rates — test-enforced); fit rules in `src/lib/productFit.ts`; variant A ranking via `POST /api/recomandari` (`src/lib/recommend.ts`, OpenAI-compatible model from `AI_BASE_URL`/`AI_API_KEY`/`AI_MODEL`, server-only, rule-based fallback). See `docs/superpowers/specs/2026-10-28-products-design.md`.
- „Metodele mele” (`/metode`, `src/lib/plans.ts`): recommendation sets are saved per account as a stack (newest = current, older = history); users pick categories as drafts and confirm the ones they use. A changed profile/risk snapshot makes the current set stale; regenerating pushes a new set and keeps the old one read-only in history. `DemoState` v8.
