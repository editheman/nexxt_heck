# CLAUDE.md — Protejează ce ai construit

## 1. Project Overview

Build a polished, functional financial education web application for Romania called "Protejează ce ai construit".

Core promise:
"Învață să-ți protejezi banii, să recunoști fraudele și să înțelegi riscurile înainte să iei o decizie financiară."

Target audience:
Romanian adults aged 20–35 who want to protect their savings, understand inflation and financial risks, and recognize scams.

This is an educational product, not a bank, broker, investment advisor, or trading platform.

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
5. Complete an interactive financial scam scenario.
6. Study a learning module.
7. Complete a quiz and receive useful feedback.
8. Refresh the page and confirm progress persists.
9. Explore privacy-safe educational progress comparisons.

Core modules:

- Reality Check: financial profile and purchasing-power analysis.
- Scenario Simulator: nominal balances versus real purchasing power.
- Learning Roadmap: inflation, returns, liquidity, diversification, fees, taxes and fraud awareness.
- Scam Awareness: realistic fictional scenarios and explanations.
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
- Do not provide personalized buy/sell recommendations or execute financial transactions.
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
- Romanian content (modules, quizzes, scam scenarios) is typed data in `src/content/`. Use comma-below ș/ț; a unit test rejects cedilla ş/ţ.
- Demo state is one versioned object in localStorage (`pcac:v1`, `src/lib/storage.ts`). Bump the version and add parsing for any shape change; parsing must never throw.
- This is Next.js 16 with Cache Components: read `node_modules/next/dist/docs/` before using unfamiliar APIs (see `AGENTS.md`).
- Checks: `npm run verify` (lint, typecheck, unit tests, build) and `npm run test:e2e` (Playwright, desktop + mobile).
- Newsletter/email capture is **demo-only** (no backend, nothing sent): rules in `src/lib/newsletter.ts`, production requirements in `docs/newsletter.md`. Never claim emails were sent; bump `CONSENT_TEXT_VERSION` (`src/content/consent.ts`) on any consent-text change; email, consent log, prompt state and reading events stay in separate storage keys.
- Reality Check is historical and read-only: official INS CPI and BNR EUR/RON series live only in `src/content/macro-ro.ts` (cite source and period in the UI; update `LATEST_DATA_YEAR` and tests together). Future-inflation assumptions belong only in the simulator.
