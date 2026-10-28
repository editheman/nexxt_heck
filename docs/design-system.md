# Design System — Protejează ce ai construit

**Revision 2026-10-28 (b): "editorial indigo".** Re-skinned to match the owner's reference mockups (Stripe-style editorial look). This supersedes the navy/teal/Lexend direction below where they conflict; tokens in `src/app/globals.css` are the source of truth.

- **Color:** indigo primary `#4F46E5` (6.3:1 on white), hover `#4338CA`, soft `#EEF0FF`; real-value green `#1E6B4E` / `#D5F5E8`; loss/danger rose `#B4322A` / `#FDE4DF`; ink `#0B1B33`, muted `#55607A`, page `#F5F6FC`. Assumptions now use the indigo family (the "x% / an" pill); estimates are mint; fictional data keeps the dashed neutral badge.
- **Type:** Hanken Grotesk 400–700 for everything (tight −0.025em tracking on headings), JetBrains Mono for eyebrow labels, tags, chips and disclaimers (`eyebrow` utility, `font-mono`). Both loaded with `latin-ext`.
- **Patterns:** mono uppercase eyebrow with dot/icon above every section title; lavender `hero-wash` backgrounds; pastel topic pills (`Tag`); cards with 18px radius, hairline border and a 4px colored top bar for feature/path cards (`Card bar=…`); pill-shaped chips for topics; segmented choice buttons (filled indigo = selected); progress bars green-on-rose for kept vs. eroded value.
- **Gradients — allowed only here:** one headline line (`text-gradient`) and the top edge of the calculator card (`bar-gradient`). No gradient buttons, surfaces or body text.
- **Reality Check (ported from `fix_reality_check`, restyled):** badge **Date oficiale** (primary text, primary/40 border, mono) only for INS/BNR series; window picker = native radio group rendered as segmented buttons like the home calculator (selected = primary fill); equivalents = cards with a rose top bar, big tabular number, item phrase and mono „Preț orientativ”, under the assumption badge „Metaforă · prețuri orientative”.
- **Home page (2026-10-28 c):** a single screen, laid out after the owner's mockup but in the indigo palette: a centred hero (headline with one `text-gradient` phrase → promise → one primary CTA → 3 trust items) and a bottom bar of 3 linked „pilon” cards. `min-h: 100dvh − header`; a `short` variant (max-height 820px) tightens spacing so 1280×720 and 1366×768 fit; phones may scroll rather than clip. The full footer is hidden on `/`; corner pills, the centre pill, the icon tile and the one-line disclaimer were removed at the owner's request.
- **Start-demo interstitial:** „Începe demo-ul” on `/` opens a native `<dialog>` with one „Știai că?” fact computed from `macro-ro.ts` (badge „Date oficiale INS/BNR”, source link and period). Auto-continues to `/profil` after 10 s with a visible countdown and progress bar; „Sari peste” (initial focus) continues now; „Pauză/Reia” stops the timer (WCAG 2.2.1); Esc closes and stays; the timer also stops while the tab is hidden. Never present these as live news.
- **Onboarding `/profil` (2 steps, no footer):** top progress bar „Pasul n din 2”, then one compact card per step (no visible title/lead — an sr-only h1 per step is the focus target); both steps fit without scrolling at 1280×720 and up. Step 1 „Să facem cunoștință”: required alias (prenume/pseudonim, never full name), optional e-mail that reveals the separate unchecked digest consent only when typed (stored via the newsletter flow, source `onboarding`), optional age-range segmented toggle (20–25 / 26–30 / 31–35, click again to clear), honest privacy note, full-width „Continuă spre datele financiare”. Step 2 „Banii tăi, pe scurt”: the financial fields, „Înapoi” keeps step-1 answers. Mockup labels not reproduced because they were untrue here: „Protocol securizat”, „Criptare end-to-end”, „Pentru etalonul Pilon II/III”.
- **Content rule kept from CLAUDE.md:** the reference mockups' news items, BNR rates, "actualizat în timp real" and "medie istorică" labels were **not** reproduced — the decodificator shows module content and computed, labelled examples only.

---

## Original direction (v1)

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
