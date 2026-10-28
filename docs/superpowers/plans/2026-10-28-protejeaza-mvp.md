# Protejează ce ai construit — MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A running Romanian financial-education web app covering the full journey landing → profil → Reality Check → simulator → fraude → modul → quiz → progres, persisted in localStorage.

**Architecture:** Next.js App Router with client components over a single versioned `DemoState` in localStorage. Pure TS modules in `src/lib` (finance, format, storage, quiz) hold all logic and are unit-tested; Romanian content is typed data in `src/content`.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind v4, Recharts 3, lucide-react, Vitest 4/5, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-28-protejeaza-design.md` · Design: `docs/design-system.md`

## Global Constraints
- All UI copy in Romanian with comma-below diacritics (ș, ț), `<html lang="ro">`.
- Every displayed amount carries a provenance badge: Datele tale / Ipoteză / Estimare / Exemplu fictiv.
- Default inflation assumption 5%/an, labelled „Ipoteză ilustrativă”; default return per placement 0%.
- Compounding: annual effective; contributions at end of month at `(1+r)^(1/12)−1`.
- Never request CNP, IBAN, card, credentials, exact income. No live data, no recommendations.
- Inputs bounded: amounts 0…100.000.000 lei, rates −10…30 %, years 0…50 (integer).
- Colors only via tokens in `globals.css`; 44px min targets; visible focus.
- localStorage key `pcac:v1`.

## Review Focus
1. Corrupt / older / missing localStorage → app loads with defaults, no crash (storage test `parse returns defaults on garbage`).
2. Empty or partially typed numeric fields ("", "1.000", "5,5") → parsed with ro-RO conventions or shown as field error, never NaN on screen (format test `parseRoNumber`).
3. Visiting `/reality-check`, `/simulator`, `/invata/x/quiz` directly with no profile or unknown slug → empty state / 404, not a crash (e2e `deep links`).
4. r = i and r < i → real value equals / falls below today's value with correct wording (finance tests).
5. Reload mid-journey → progress, profile and inflation assumption preserved (e2e `persistence`).

---

### Task 1: Scaffold + design tokens
**Files:** create Next app at repo root (`create-next-app --ts --tailwind --eslint --app --src-dir --use-npm --import-alias "@/*"`), `src/app/globals.css` (tokens from design-system.md as `@theme` vars), `src/app/layout.tsx` (Lexend + Source Sans 3 latin-ext, lang ro), `vitest.config.ts`, `playwright.config.ts`.
- [ ] Scaffold, add deps `recharts lucide-react`, dev `vitest @playwright/test`.
- [ ] Scripts: `test` = `vitest run`, `test:e2e` = `playwright test`, `typecheck` = `tsc --noEmit`.
- [ ] Verify `npm run build` passes. Commit.

### Task 2: Finance library (TDD)
**Files:** `src/lib/finance.ts`, `src/lib/finance.test.ts`
**Produces:** `type SimInput = { principal; monthly; nominalPct; inflationPct; years }` (numbers); `validateSimInput(i): Partial<Record<keyof SimInput,string>>` (Romanian messages); `realRatePct(nominalPct, inflationPct): number`; `project(i): { year; nominal; real; contributed }[]` (length years+1); `summarize(i): { nominal; real; contributed; purchasingPowerGap; realRatePct }`.
- [ ] Tests: `project({P:1000,r:0,i:0,n:0})[0] = {nominal:1000, real:1000}`; `P=1000,r=10,n=2 → nominal 1210`; `P=1000,r=0,i=5,n=10 → real ≈ 613.91`; `r=i → real == P` (±1e-9); `realRatePct(10,5) ≈ 4.7619`; `monthly=100,r=0,n=1 → nominal 1200`; `monthly=100,r=12,n=1 → nominal ≈ 1264.65` (end-of-month, rm=(1.12)^(1/12)−1); validation rejects years 2.5, −1, 51, rate 31, NaN.
- [ ] Implement, run `npx vitest run src/lib/finance.test.ts` → PASS. Commit.

### Task 3: Format + storage + quiz logic (TDD)
**Files:** `src/lib/format.ts`, `src/lib/storage.ts`, `src/lib/quiz.ts`, tests beside each.
**Produces:** `formatLei(n): string` (`"12.346 lei"`, 0 decimals), `formatPct(n, d=1)` (`"5,0%"`), `parseRoNumber(s): number | null` (accepts "1.000", "5,5", "1000.5"? → treat single dot with ≤2 decimals as decimal, otherwise thousands); `DemoState`, `Profile` types per spec §4; `defaultState()`, `parseState(raw: string|null): DemoState`, `demoStore` with `get/subscribe/update(fn)/reset()`; hook `useDemoState()` in `src/lib/useDemoState.ts` (useSyncExternalStore, `hydrated` flag); `scoreQuiz(questions, answers): { correct; total; wrongIds }`, `questionsForRetry(questions, wrongIds)`.
- [ ] Tests: `parseState("{bad")` → defaults; `parseState` of `{version:0}` → defaults; valid state round-trips; `formatLei(12345.6)` = `12.346 lei` (normalise NBSP); `parseRoNumber("5,5")=5.5`, `("1.000")=1000`, `("")=null`, `("abc")=null`; scoreQuiz counts and wrongIds order.
- [ ] Implement, tests pass. Commit.

### Task 4: UI primitives + app shell
**Files:** `src/components/ui/{Button,Card,Badge,Field,Alert,Slider}.tsx`, `src/components/{SiteHeader,SiteFooter,DemoNotice}.tsx`, layout wiring.
**Produces:** `<Badge kind="user|assumption|estimate|fictional">`, `<NumberField label suffix value onChange error helper id>` (text input, inputMode decimal, parseRoNumber on blur), `<Alert tone="info|assumption|success|danger" title>`.
- [ ] Header nav with aria-current + mobile disclosure menu; skip link; footer with disclaimer + official sources. Build passes. Commit.

### Task 5: Landing + Profil
**Files:** `src/app/page.tsx`, `src/app/profil/page.tsx`, `src/components/profile/ProfileForm.tsx`, `src/content/demoProfile.ts`.
- [ ] Profile form per spec §2 step 2, blur validation, focusable error summary, save → `/reality-check`. "Încarcă profilul exemplu" on landing and form. Commit.

### Task 6: Reality Check + Simulator
**Files:** `src/app/reality-check/page.tsx`, `src/app/simulator/page.tsx`, `src/components/sim/{ProjectionChart,ProjectionTable,AssumptionControl,StatCard}.tsx`.
- [ ] Reality Check: 3 stat cards (today, nominal in n years, putere de cumpărare), real rate sentence, editable inflation (persists to `assumptions.inflationPct`), empty state without profile, marks `visited.reality`.
- [ ] Simulator: controls seeded from profile, presets, chart (solid/dashed, reduced-motion aware), table toggle, live summary (`aria-live="polite"`), marks `visited.simulator`. Commit.

### Task 7: Content — modules, quizzes, scams
**Files:** `src/content/modules.ts`, `src/content/scams.ts`, `src/content/types.ts`.
**Produces:** `Module { slug; title; summary; minutes; sections: {id; title; body: string[]}[]; takeaways: string[]; quiz: Question[] }`, `Question { id; prompt; options: {id; text; explanation}[]; correctId; sectionId }`, `Scam { id; title; channel; message; choices: {id; text; safe: boolean; feedback}[]; redFlags: string[]; safeSteps: string[] }`.
- [ ] 7 modules × 3–4 sections × 4 questions; 4 scams. Content test: every question's correctId and sectionId exist; unique slugs. Commit.

### Task 8: Fraude, Învață, Quiz, Progres pages
**Files:** `src/app/fraude/page.tsx`, `src/app/invata/page.tsx`, `src/app/invata/[slug]/page.tsx`, `src/app/invata/[slug]/quiz/page.tsx`, `src/app/progres/page.tsx`, feature components under `src/components/{scam,learn,quiz,progress}`.
- [ ] Scam stepper with per-choice feedback + red flags; records result. Module page with anchors + mark read; quiz with per-answer feedback, score, revision links `#sectionId`, retry wrong only; progress checklist + reset with confirm dialog; `notFound()` for unknown slugs (generateStaticParams). Commit.

### Task 9: E2E + verification
**Files:** `e2e/journey.spec.ts`
- [ ] Tests: full journey with reload persistence; inflation change updates Reality Check value; wrong quiz answer shows explanation + "Recitește" link; deep links without profile show empty state; mobile viewport menu works.
- [ ] Run lint, typecheck, vitest, build, playwright; fix; commit.

### Task 10 (optional): Friends comparison
Opt-in alias + fictional demo friends ranking by progress % only, on `/progres`.
