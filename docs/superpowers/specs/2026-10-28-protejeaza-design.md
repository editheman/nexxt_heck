# Protejează ce ai construit — Product & Technical Design

Date: 2026-10-28 · Status: approved for build (owner opted out of further discovery; decisions below marked **[call]** were made by Claude and can be revisited).

## 1. Intent

A working Romanian web app (not a static prototype) that helps adults aged 20–35 understand how inflation affects their savings, explore hypothetical scenarios honestly, recognise financial scams, and learn the core concepts through short modules and quizzes. First audience: Stripe Hackathon judges; real audience: Romanian users. Product promise (from CLAUDE.md): *„Învață să-ți protejezi banii, să recunoști fraudele și să înțelegi riscurile înainte să iei o decizie financiară.”*

### Success
- A judge can go from landing → profile → Reality Check → simulator → scam exercise → module → quiz → progress, refresh, and find everything preserved — with no dead controls and no console errors.
- Every number on screen is traceable to user input + an assumption that is visible and editable.

### Non-goals
- No accounts, backend, payments, live market data, or real regulatory checks.
- No personalised investment advice, product recommendations, or transactions.

### Anti-goals (failure even if it "works")
- Presenting an illustrative rate as a real or current rate, or a hypothetical return as a forecast.
- Asking for CNP, IBAN, card data, bank credentials, or exact income.
- Trading-terminal / crypto-dashboard look; fake testimonials or trust badges.
- English or diacritic-less Romanian in the UI.

## 2. Primary journey

| # | Route | What happens |
|---|-------|--------------|
| 1 | `/` | Landing: promise, what the demo does, clear "date fictive / educațional" note, CTA **Începe demo-ul**. Also "Încarcă un profil exemplu" (fills fictional demo profile). |
| 2 | `/profil` | Minimal profile: alias (optional), economii actuale (RON), unde sunt ținute (numerar / cont curent / depozit / investiții / mix), randament nominal anual estimat (% — user's own estimate, default per placement is **0%**, never a market figure), economisire lunară (RON, optional), orizont (ani), obiectiv. Inline validation on blur, focusable error summary on submit. |
| 3 | `/reality-check` | Nominal value after n years vs. value in today's RON, real rate, and a plain-language explanation. Inflation is an **ipoteză ilustrativă** (default 5%/an **[call]**), editable inline, with a link to INS for official data. |
| 4 | `/simulator` | Sliders + numeric inputs for P, monthly contribution, r, i, n. Line chart: nominal (solid) vs. putere de cumpărare (dashed), direct labels, toggleable data table. Three illustrative presets ("Bani ținuți în numerar", "Randament egal cu inflația", "Randament ipotetic peste inflație") — labelled as hypotheses, not products. |
| 5 | `/fraude` | Interactive fictional scenarios (SMS curier, „platformă de investiții” cu randament garantat, „angajat al băncii” la telefon, prieten pe WhatsApp care cere bani). User picks what they'd do; each choice gets feedback naming the red flags. Completion recorded. |
| 6 | `/invata`, `/invata/[slug]` | Roadmap of 7 modules (inflație, randament real, lichiditate, diversificare, comisioane, taxe, fraude). Each: short sections with anchors, key takeaways, "Marchează ca citit". |
| 7 | `/invata/[slug]/quiz` | 3–5 questions; per-answer explanation; final score; for each missed question a link to the exact section to re-read and a "Reia doar întrebările greșite" retry (adaptive revision). Best score stored. |
| 8 | `/progres` | Journey checklist, modules read, best quiz scores, scams completed, "Resetează demo-ul" (with confirmation). |
| 9 | `/progres` (section) — *optional* | Friends: opt-in alias, compare **only** learning progress against clearly labelled fictional demo friends. Never shows financial data. |

Persistent top nav (desktop) / compact menu (mobile): Reality Check · Simulator · Fraude · Învață · Progres. A small "Demo · date stocate doar în browserul tău" indicator is always visible.

## 3. Financial model (lib/finance.ts — pure, unit-tested)

- Inputs: P ≥ 0, monthly contribution C ≥ 0, nominal annual r, annual inflation i (both > −100%, UI-limited to −10%…30%), n integer years 0…50.
- **Compounding convention [call]:** annual effective rates. Lump sum: `FV = P·(1+r)^n`. Contributions are made at the **end of each month**, grown at the equivalent monthly rate `rm = (1+r)^(1/12) − 1` (so a lump sum is exactly consistent with the CLAUDE.md formula). When `rm = 0`, contributions sum linearly.
- **Real value:** `FV_real = FV_nominal / (1+i)^t`, t in years (monthly t = m/12).
- **Real rate:** `(1+r)/(1+i) − 1` (exact Fisher, not r − i).
- Yearly series for charts: year 0…n with nominal, real, total contributed.
- "Pierdere de putere de cumpărare" is shown only as `nominal − real` *under the stated assumptions*, worded as an estimate.

## 4. Architecture

- Next.js 16 App Router, TypeScript strict, Tailwind v4, Recharts, lucide-react icons. No shadcn CLI scaffolding **[call]**: a small set of hand-written accessible primitives (Button, Card, Field, Slider, Alert) is less dependency surface for this size; patterns follow shadcn/Radix conventions.
- All pages are client-interactive; content (modules, quizzes, scam scenarios) lives as typed data in `src/content/*` — no CMS.
- State: one versioned `DemoState` object in localStorage (`pcac:v1`), read via a `useSyncExternalStore`-based store; parsing validates shape and falls back to defaults on corrupt data. Pages render a skeleton until hydrated to avoid SSR mismatch.
- Structure: `src/lib` (finance, format, storage, quiz logic — no React), `src/content` (Romanian content), `src/components` (UI primitives + feature components), `src/app` (routes).

```ts
type DemoState = {
  version: 1;
  profile: Profile | null;
  assumptions: { inflationPct: number };       // illustrative, user-editable
  progress: {
    visited: Partial<Record<'reality'|'simulator', true>>;
    scams: Record<string, { completed: true; correct: number; total: number }>;
    modulesRead: Record<string, true>;
    quizzes: Record<string, { best: number; total: number; lastWrong: string[] }>;
  };
  social: { optIn: boolean; alias: string };   // optional feature
};
```

## 5. Content & safety rules
- Labels: **Datele tale** (user-provided), **Ipoteză** (illustrative assumption), **Estimare** (calculated), **Exemplu fictiv** (scenarios / demo data). Each has a distinct badge.
- Official sources referenced only by name + homepage for verification: INS (insse.ro, inflație), BNR (bnr.ro), ASF (asfromania.ro, avertizări entități neautorizate), DNSC (dnsc.ro, raportare fraude), ANAF (anaf.ro, taxe). No numbers attributed to them.
- Taxes module explains concepts only; no rates.

## 6. Testing & acceptance
- Vitest: finance formulas (zero rates, zero years, r = i, negative real rate, contributions with rm = 0, invalid input rejection), formatting (ro-RO), storage parse/migrate/corrupt fallback, quiz scoring/retry selection.
- Playwright e2e: full journey incl. reload persistence; assumption change updates Reality Check numbers; quiz wrong answer shows explanation + revision link; mobile viewport smoke.
- Gates: `tsc --noEmit`, `eslint`, `vitest run`, `next build`, `playwright test`.

## 7. Scope
- **Essential (MVP):** steps 1–8, all 7 modules with quizzes, 4 scam scenarios, responsive, keyboard accessible, tests above.
- **Optional:** friends comparison, dark mode, print/export of results, more scenarios.

## 8. Left to the builder
Exact copy, illustration-free visual details within the design system, component decomposition.
