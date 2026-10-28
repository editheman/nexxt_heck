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
| 3 | `/reality-check` | Historical, read-only: the user's savings kept without interest over the last 3 / 5 / 10 complete years (default 5), using official INS annual average CPI and BNR annual EUR/RON averages (`src/content/macro-ro.ts`). Shows cumulative price rise, purchasing power in base-year lei, the loss, the EUR view, and 2–3 tangible equivalents („Ce puteai cumpăra cu banii mâncați de inflație”, metaphor with approximate prices). No inflation input — assumptions about the future live only in the simulator. |
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
- **Contributions in today's RON (2026-10-29):** each end-of-month payment is deflated when it is made, with `im = (1+i)^(1/12) − 1`: `C_real = P + C·(1 − (1+im)^(−12n)) / im` (linear when `im = 0`). The explanation compares the balance in today's RON with `C_real` (like with like) — never with nominal contributions. Real annual return is Fisher: `(1+r)/(1+i) − 1`. Baseline check (39.000 lei, 800 lei/lună, 5%, 5%, 15 ani): contributed 183.000, nominal ≈ 292.938, today's RON ≈ 140.908 = `C_real`, real return 0%.
- "Pierdere de putere de cumpărare" is shown only as `nominal − real` *under the stated assumptions*, worded as an estimate.

### 3b. Historical Reality Check
- Data (2025 values cross-checked 2026-10-28: BNR monthly averages give 5,0415; INS 2025 average inflation 7,3% per INS release coverage): INS „IPC – serie de date anuală”, average annual index (previous year = 100), 2015–2025; BNR annual EUR/RON average (mean of the 12 monthly averages) for base years 2015, 2016, 2020–2025. Stored locally; no live data.
- Window n ∈ {3, 5, 10} complete years ending 2025. `priceFactor = ∏(1 + i_t)` for t = 2025−n+1 … 2025, which compares the 2025 average price level to the base year 2025−n.
- `P_real = P / priceFactor` (base-year lei), `Δ = P − P_real`. P = profile savings, assumed held with no interest (no historical deposit rates are invented).
- EUR view: `P / rate(base)` vs `P / rate(2025)`; leu change = `rate(base)/rate(2025) − 1`.
- Equivalents (`src/content/equivalents.ts`, `src/lib/equivalents.ts`): tier by Δ (<500, 500–5k, 5k–30k, 30k–100k, ≥100k); items from Δ's tier whose `⌊Δ / price⌋ ≥ 1`, filled from lower tiers to ≥ 2, max 3; the Pipera villa is shown as a % of one. Romanian plurals via `formatCount` („1 pachet”, „4 pachete”, „20 de pachete”).

## 4. Architecture

- Next.js 16 App Router, TypeScript strict, Tailwind v4, Recharts, lucide-react icons. No shadcn CLI scaffolding **[call]**: a small set of hand-written accessible primitives (Button, Card, Field, Slider, Alert) is less dependency surface for this size; patterns follow shadcn/Radix conventions.
- All pages are client-interactive; content (modules, quizzes, scam scenarios) lives as typed data in `src/content/*` — no CMS.
- State: one versioned `DemoState` object in localStorage under the key `pcac:v1` (schema `version: 2`; version-1 data is migrated on read), read via a `useSyncExternalStore`-based store; parsing validates shape and falls back to defaults on corrupt data. Pages render a skeleton until hydrated to avoid SSR mismatch.
- Structure: `src/lib` (finance, format, storage, quiz logic — no React), `src/content` (Romanian content), `src/components` (UI primitives + feature components), `src/app` (routes).

```ts
type DemoState = {
  version: 2;
  profile: Profile | null;
  assumptions: { inflationPct: number };       // simulator only: illustrative, user-editable
  reality: { years: 3 | 5 | 10 };              // Reality Check history window
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
- Official sources referenced by name + homepage for verification: INS (insse.ro, inflație), BNR (bnr.ro), ASF (asfromania.ro, avertizări entități neautorizate), DNSC (dnsc.ro, raportare fraude), ANAF (anaf.ro, taxe). The only figures attributed to them are the INS CPI and BNR EUR/RON historical series in `src/content/macro-ro.ts`, cited with source and period in the UI.
- Equivalent prices are approximate and illustrative, labelled „Metaforă · prețuri orientative”.
- Taxes module explains concepts only; no rates.

## 6. Testing & acceptance
- Vitest: finance formulas (zero rates, zero years, r = i, negative real rate, contributions with rm = 0, invalid input rejection), formatting (ro-RO), storage parse/migrate/corrupt fallback, quiz scoring/retry selection.
- Playwright e2e: full journey incl. reload persistence; changing the history window updates the Reality Check loss and equivalents; v1 → v2 storage migration; quiz wrong answer shows explanation + revision link; mobile viewport smoke.
- Gates: `tsc --noEmit`, `eslint`, `vitest run`, `next build`, `playwright test`.

## 7. Scope
- **Essential (MVP):** steps 1–8, all 7 modules with quizzes, 4 scam scenarios, responsive, keyboard accessible, tests above.
- **Optional:** friends comparison, dark mode, print/export of results, more scenarios.

## 8. Left to the builder
Exact copy, illustration-free visual details within the design system, component decomposition.
