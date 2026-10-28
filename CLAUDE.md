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

## 3. Product Priorities & Progressive Profiling Flow

No forced login or heavy onboarding up-front. The primary journey uses a "Give-to-Get" progressive profiling funnel:

1. **Top of Funnel — Zero-Friction Hook (Public Home)**:
   - Live macro fun-facts banner/ticker based on pre-processed Romanian economic indicators and verified news.
   - Micro-interaction: "În ce domeniu activezi?" with 1-click industry chips (e.g., IT & Tech, HoReCa, Sănătate, Corporate & Servicii, Construcții, Freelancer / Student).
2. **Instant Reward (Dynamic Sector Insight)**:
   - Selecting an industry instantly renders a tailored financial fun-fact / benchmark for that Romanian sector (e.g., real salary growth vs. inflation impact on local dining/rent).
3. **Organic Inline Profile Expansion (No intrusive pop-ups)**:
   - An inline contextual reveal transitions the user into the Reality Check: *"Vrei să vezi calculul exact pe buzunarul tău?"*
   - Requests minimal non-identifying inputs via sliders/steppers: approximate net monthly income and cash/current-account savings.
4. **Reality Check & Tangible Loss Shock**:
   - Calculates real purchasing power loss using read-only historical inflation and RON depreciation data (INS/BNR).
   - Translates lost purchasing power into funny, tangible opportunity costs (e.g., cartons of cigarettes, specialty coffees, Cluj/Bucharest rent, clean BMWs, villas in Pipera).
5. **Interactive Scam Awareness Scenario**:
   - Complete an engaging, realistic fictional Romanian fraud case (phishing, fake broker, crypto scheme).
6. **Learning Roadmap & Adaptive Quiz**:
   - Short module on inflation, compounding, diversification, and fraud markers with answer-level feedback.
7. **Session Persistence & Educational Identity**:
   - LocalStorage saves the generated profile and progress anonymously (`pcac:v1`).
   - Opt-in creation of a privacy-safe alias for comparing educational completion with friends.

Build this end-to-end journey before secondary features.

## 4. Financial Accuracy, AI Ingestion & Safety

- **Real Macro Data (INS & BNR)**:
  - Historical inflation (IPC) and FX series are strictly read-only and loaded from verified datasets (`src/content/macro-ro.ts`).
  - Users cannot arbitrarily override historical inflation rates in the Reality Check module.
- **AI-Curated News & Fun Facts Pipeline**:
  - Do NOT invoke live LLM calls on every client page visit (avoids latency, operational costs, and runtime hallucinations).
  - Use a batch/build-time ingestion workflow (or cache script) that processes vetted economic news and indicators into typed, validated JSON structures (`src/content/dynamic-facts.json`) validated with Zod schemas.
  - Fallbacks must always exist in static data if dynamic updates are unavailable.
- **Clear Separation of Math and Metaphors**:
  - Formulas for purchasing power loss must be 100% mathematically accurate.
  - Tangible comparisons (cigarettes, BMWs, Pipera villas) must be clearly labeled as educational opportunity-cost metaphors.
- **Zero Sensitive Data**:
  - Never ask for CNPs, bank logins, card details, or exact employer names.
  - Never broadcast or display personal financial figures in social or comparison views.
  - No personalized buy/sell trading advice.

## 5. UX and Visual Design

- All user-facing product content must be in Romanian with proper comma-below diacritics (ș, ț).
- Calm, trustworthy, premium fintech visual style; avoid generic startup templates or crypto-casino aesthetics.
- **No Intrusive Modals for Onboarding**:
  - Never display blocking modals like *"Hello stranger..."*.
  - Use inline step expansions, progressive reveals, or subtle slide-overs that maintain context.
- Keep the tone witty and self-aware for Romanians aged 20–35 (relatable cultural references: shaorma, festival tickets, Cluj rent, German sedans), while retaining absolute rigor in financial numbers.
- Ensure full keyboard accessibility and mobile responsiveness (test on mobile viewports).
- Zero broken buttons; every control must perform an observable action.

## 6. Technical Principles

Stack:
- Next.js 16 (App Router) with TypeScript strict mode
- Tailwind CSS
- shadcn/ui components
- Recharts for financial visualisations
- Zod for contract and dynamic content validation
- LocalStorage for client-side persistence

Architecture:
- Keep financial logic testable and separated in `src/lib/finance.ts`.
- Store macroeconomic series in `src/content/macro-ro.ts`.
- Store tangible equivalent benchmarks and pluralization rules in `src/content/equivalents.ts`.
- Store dynamic facts and industry insights in `src/content/dynamic-facts.json` validated by `src/lib/schemas/facts.ts`.
- Persist state safely under the `pcac:v1` key in `src/lib/storage.ts` without throwing on parse errors.

## 7. Financial Calculation Requirements

### A. Real Purchasing Power Loss (Reality Check)
Using the official historical consumer price index (IPC) series:
$$P_{\text{real}} = \frac{P_{\text{nominal}}}{\prod_{t=1}^n (1 + i_t)}$$
Where $i_t$ represents the annual Romanian inflation rates for the selected window.

Absolute lost purchasing power:
$$\Delta_{\text{pierdere}} = P_{\text{nominal}} - P_{\text{real}}$$

### B. Tangible Cost Equivalents (Lost Opportunity Index)
- Calculate equivalent units: $\text{Cantitate} = \lfloor \Delta_{\text{pierdere}} / \text{Preț Bun} \rfloor$.
- Select 2–3 proportional comparisons from `src/content/equivalents.ts` based on loss brackets:
  - `< 500 RON`: Pachete de țigări (~28 RON), cafele de specialitate (~18 RON), shaorme mari (~35 RON).
  - `500 – 5.000 RON`: Plinuri de benzină (~400 RON), abonamente anuale de sală (~2.000 RON), bilete VIP festival (~1.200 RON).
  - `5.000 – 30.000 RON`: iPhone-uri noi (~6.500 RON), luni de chirie 2 camere Cluj/București (~2.500 RON/lună).
  - `30.000 – 100.000 RON`: Un BMW E46 / Golf îngrijit (~25.000 RON), avans credit garsonieră (~60.000 RON).
  - `> 100.000 RON`: Mașină electrică nouă (~180.000 RON), avans penthouse sau fracțiuni dintr-o vilă în Pipera (~1.500.000 RON).
- Format strings using proper Romanian grammar and plural forms (e.g., "1 pachet", "4 pachete", "21 de pachete").

### C. General Future Projections (Scenario Simulator)
Nominal future value:
$$P \times (1 + r)^n$$
Real future value:
$$\frac{P \times (1 + r)^n}{(1 + i)^n}$$
Document compounding rules and monthly contribution conventions explicitly.

## 8. Testing and Quality

- Run `npm run verify` (lint, typecheck, unit tests, build).
- Run `npm run test:e2e` for end-to-end user journeys (desktop and mobile).
- Unit tests must cover:
  - Financial calculations (zero rates, negative rates, boundary values).
  - Tangible item selection logic and pluralization algorithms.
  - Zod schema validation for dynamic facts and news.
  - Content diacritics check (rejection of cedilla ş/ţ in favor of comma-below ș/ț).
- Verify progressive profiling steps update state dynamically without layout shifts or intrusive pop-ups.

## 9. Definition of Done

A feature is complete only when:
1. It fulfills the progressive profiling flow without requiring authentication.
2. Macro data and inflation losses strictly match official Romanian records.
3. Opportunity cost items render with correct Romanian plurals and contextual relevance.
4. UI matches the calm fintech design system with zero intrusive pop-ups.
5. All automated checks (`npm run verify` and `npm run test:e2e`) pass cleanly.

## 10. Project Map

- Design system tokens & guide: `docs/design-system.md` & `src/app/globals.css`.
- Mathematical logic: `src/lib/finance.ts`.
- Macroeconomic datasets (INS/BNR): `src/content/macro-ro.ts`.
- Tangible item catalog & pluralizers: `src/content/equivalents.ts`.
- Industry facts & dynamic news: `src/content/dynamic-facts.json`.
- Fact schema definitions: `src/lib/schemas/facts.ts`.
- Local persistence: `src/lib/storage.ts` (`pcac:v1`).