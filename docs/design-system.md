# Design System — Protejează ce ai construit

Source: UI UX Pro Max research (2026-10-28). The tool's top `--design-system` match (dark "Enterprise Gateway", navy + neon green, "light mode default" listed as an anti-pattern) was **rejected** because it reads like a trading terminal, which CLAUDE.md forbids. What was kept: the *Banking/Traditional Finance* palette (trust navy), the *LMS* teal for learning/progress, the *Corporate Trust* font pairing, the chart guidance for trends over time, and the form/accessibility guidance. Tokens are defined in `src/app/globals.css`; components never use raw hex.

## Direction
Calm, editorial, premium-but-plain. A light, paper-like background, navy ink, one teal accent standing for "protected / real value", amber reserved for assumptions and caution. Generous whitespace, few borders, soft single-layer shadows. The product should feel like a well-made public-service guide, not a bank ad or a trading app.

## Color tokens (light, default)
| Token | Hex | Use | Contrast on surface |
|---|---|---|---|
| `--bg` | `#F6F7F9` | page background | — |
| `--surface` | `#FFFFFF` | cards, inputs | — |
| `--surface-muted` | `#EEF1F5` | subtle panels, table stripes | — |
| `--ink` | `#0F1B2D` | primary text, headings | 17:1 |
| `--ink-muted` | `#4A5568` | secondary text | 7.5:1 |
| `--border` | `#D9DEE6` | dividers, input borders (input uses `--border-strong` `#8A94A6`, 3:1) | — |
| `--primary` | `#16325C` | primary buttons, links, nominal series | 12:1 |
| `--primary-hover` | `#0F2647` | | |
| `--accent` | `#0F766E` | real value, progress, success-adjacent | 5.4:1 |
| `--accent-soft` | `#E6F4F2` | accent backgrounds | |
| `--assumption` | `#B45309` | "Ipoteză" badge, caution | 5.0:1 |
| `--assumption-soft` | `#FDF3E7` | | |
| `--danger` | `#B42318` | errors, scam red flags | 6.0:1 |
| `--danger-soft` | `#FDECEA` | | |
| `--success` | `#1F7A3D` | correct answers | 5.3:1 |
| `--success-soft` | `#E8F5EC` | | |
| `--ring` | `#2563EB` | focus ring (2px + 2px offset) | |

Data-provenance badges (always text + color, never color alone): **Datele tale** (primary on muted), **Date oficiale** (primary text, solid primary/40 border — INS/BNR series only), **Ipoteză** (assumption), **Estimare** (accent), **Exemplu fictiv** (ink-muted, dashed border).

## Typography
- Headings: **Lexend** 500/600; body & UI: **Source Sans 3** 400/600. Both loaded via `next/font/google` with `latin-ext` (ă, â, î, ș, ț — comma-below forms).
- Scale (rem): 0.875 caption · 1 body (16px, lh 1.6) · 1.125 lead · 1.25 h4 · 1.5 h3 · 2 h2 · 2.5–3 h1 (clamp).
- Numbers: `font-variant-numeric: tabular-nums` for all amounts. Format with `Intl.NumberFormat('ro-RO')` → `12.345 lei`; percentages `5,0%`.
- Max line length ~68ch for reading content.

## Spacing, layout, responsive
- 4px base; scale 4/8/12/16/24/32/48/64/96.
- Container max 1120px; reading pages max 720px. Gutters 16px mobile, 24px tablet, 32px desktop.
- Breakpoints: mobile-first, `sm 640 · md 768 · lg 1024`. Simulator: controls stack above chart < lg, side-by-side ≥ lg.
- Radius: 8px controls, 16px cards. Shadow: `0 1px 2px rgb(15 27 45 / .06), 0 4px 16px rgb(15 27 45 / .05)`.

## Components
- **Buttons:** primary (navy fill), secondary (surface + border), ghost (text). Min height 44px, visible focus ring, disabled = 50% opacity + `aria-disabled`, loading state with spinner + label.
- **Cards:** surface, 16px radius, 24px padding; stat cards show label → big tabular number → provenance badge → one-line explanation.
- **Navigation:** sticky top bar with wordmark + 5 links, `aria-current="page"`; on < md a disclosure menu button (labelled "Meniu"). Skip link "Sari la conținut".
- **Forms:** visible labels, helper text under label, suffix units ("lei", "%", "ani"), validation on blur, error text under field linked via `aria-describedby`, focusable error summary on submit (`role="alert"`).
- **Sliders:** always paired with a numeric input; keyboard operable; value announced.
- **Charts (Recharts):** line chart; nominal = navy solid, putere de cumpărare = teal dashed; direct end labels + legend; tooltip with both values; a "Vezi tabelul" toggle renders the same data as an accessible table; one-sentence text summary above the chart.
- **Feedback:** inline Alert (info/assumption/success/danger) with icon + title + text; quiz answers show correct/incorrect with icon + word, not color alone.
- **Window picker (Reality Check):** native radio group inside a `fieldset`/`legend`, rendered as segmented buttons (selected = primary fill); no inflation input on this page.
- **Equivalents („Ce puteai cumpăra…”):** cards with a big tabular number and the item phrase below, „Preț orientativ” note, section badge „Metaforă · prețuri orientative” (assumption). Tone: dry, self-aware wake-up line — never meme-style, no emoji.
- **Home funnel (no modals):** hero → „Economia, pe scurt” strip (Zod-validated facts from `dynamic-facts.json`, horizontally scrollable, no auto-motion, each card cites its source) → „În ce domeniu activezi?” chips (native radio group, pill-shaped, selected = primary fill) → sector insight card (badge „Date oficiale INS” or „Calculat din date oficiale”) → disclosure button „Vrei să vezi calculul exact pe buzunarul tău?” (`aria-expanded`) revealing two slider+input pairs (venit net, economii) and an instant accent-soft result panel → CTA „Vezi calculul complet”.
- **Friends comparison (Progres):** opt-in alias form → read-only share code with Copy → add-code form with inline Alert feedback → table of alias, %, modules, quizzes, scenarios. Never shows amounts.
- **Empty states:** e.g. Reality Check with no profile → explanation + CTA to `/profil` or "Folosește profilul exemplu".

## Motion
Subtle only: 150–200ms color/opacity transitions; no scroll-jacking, no number count-ups. Respect `prefers-reduced-motion` (disable chart animation).

## Accessibility requirements
WCAG 2.2 AA: 4.5:1 text contrast, 3:1 UI boundaries, keyboard access for everything, visible focus, `lang="ro"`, semantic landmarks and headings, labelled icon buttons, live region for quiz feedback and calculation summaries, no information by color alone, 44×44 targets, zoom to 200% without horizontal scroll.

## Avoid
- Dark trading-terminal look, candlesticks, red/green ticker colors, neon accents.
- Gradients on surfaces/text, glassmorphism, emoji as icons, stock photos of money.
- Fake testimonials, user counts, "certified/secure" badges, partner logos.
- Big "profit" numbers without the provenance badge and assumptions next to them.
- Placeholder-only labels, toasts as the only error feedback.
