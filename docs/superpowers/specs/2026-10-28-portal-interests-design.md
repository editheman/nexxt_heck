# Interests, guided profiling and user portal — Design

> **Superseded (2026-10-28, same day):** the owner dropped the interests page. Learning is now personalised by the savings goal chosen in profile step 2 (`src/content/goalPaths.ts`); profiling is profil → Reality Check → simulator → portal (3 steps). `DemoState` v5 drops `interests`. The portal and onboarding-chain parts below still apply.

Date: 2026-10-28 · Requested by the owner. Decisions marked **[call]** were made by Claude.

## Flow
Guided profiling (shown with „Pasul n din 4” and a „Pasul următor” card):
1. `/profil` — onboarding (2 sub-steps: identity, money)
2. `/reality-check`
3. `/interese` — pick topics to learn about (new)
4. `/simulator` — ends with „Finalizează profilarea” → sets `onboarding.completedAt` → `/portal`

After profiling, pages are **not chained**: `/portal` is the hub with Reality Check, Simulator, Învață (with modules recommended from the interests), Fraude, Progres, and „Modifică profilul / interesele”. Fraude and Învață are no longer steps of the chain; on those pages the footer card links back to the portal. Visiting Reality Check or the simulator after profiling shows „← Portalul tău” instead of step labels.

Header: before profiling only logo + „Începe”; after profiling the nav (Portalul meu, Reality Check, Simulator, Fraude, Învață) and the progress avatar **[call]**. Pages stay reachable by URL at any time (demo, no auth).

## „Account”
**[call]** There is no backend: the "account" is the local demo profile in this browser. Interests are stored in the same `DemoState` as the profile. Real accounts (sign-up, login, server storage, deletion/export rights) are out of scope and listed as production work.

## Interests
Multi-select, at least one. Each topic maps to an existing module so every choice leads to real content; „Investiții prin ETF-uri” gets a new module (`etf`) **[call]** — general education only: what an ETF is, costs (TER/costuri curente in the KID), risks, how to check a broker's authorisation (ASF). No products, returns or tax rates.

## Data
`DemoState` v4: `interests: TopicId[]` (unknown ids dropped), `onboarding: { completedAt: string | null }`. v1–v3 migrate with `interests: []`, `completedAt: null`. „Resetează demo-ul” clears both.

## Tests
Unit: storage v4 parse/migrate; `recommendedModules(interests)` order and de-duplication; topic → module mapping covers existing slugs; ETF module content checks. E2E: chain profile → RC → interese (validation: ≥1) → simulator → finish → portal; portal shows recommended modules for chosen interests; nav hidden before / shown after; RC from portal shows the portal link, not „Pasul”; interests editable from portal and persisted across reloads.
