# „Metodele mele” — chosen methods, confirmation and re-profiling history — Design

Date: 2026-10-29 · Branch `update-recomandari` · Requested by the owner.

## Goal
Turn recommendations into a profile of what the user actually does: pick recommended categories as **drafts**, confirm the ones they **use**, and keep a **history** (stack) of past recommendation sets when the profile changes, so the user is re-profiled and old sets remain visible next to the current one.

## Concepts
- **Generation (set of recommendations):** saved when the user generates recommendations. Holds the ranked items (id, why, watchOut), source (ai/reguli, model), creation time and a **snapshot** of the inputs (horizon, goal, placement, savings, monthly, age range, the four risk answers).
- **Current vs history:** the newest generation is *current*; older ones are *history*, shown newest first (a stack).
- **Method:** a product category the user picked from a generation: `{ productId, generationId, status: "draft" | "confirmed", addedAt, confirmedAt? }`.

## Rules
- „Aleg această metodă” on a current recommendation adds a draft (idempotent); pressing again removes it while it is a draft.
- On „Metodele mele” a draft can be confirmed („Confirm că o folosesc”) or removed; a confirmed method can be set back to draft („Nu o mai folosesc”).
- Generating with **the same snapshot** as the current generation updates it in place; methods whose category is no longer recommended are dropped from it. Generating with a **different snapshot** pushes a new current generation; the previous one and its methods become read-only history.
- When the saved inputs differ from the current generation's snapshot, the recommendations page shows that the profile changed and invites a new generation; the stored set is still displayed until then.
- History is capped at 20 generations (oldest dropped) [call].
- Methods only reference „consider” categories (only those can be recommended).
- Everything lives in the account's `DemoState` (v8), so it is per account and persists across reloads; „Resetează demo-ul” clears it.

## UI
- Recommendation card: primary/secondary toggle button with `aria-pressed`; text „Aleg această metodă” / „Aleasă · în Metodele mele”.
- Portal: special highlighted card „Metodele mele” with counts (în draft · folosite) → `/metode`.
- `/metode`: „Actuale” (date + profile summary of the current set; sections „În draft” and „Le folosesc”), link back to recommendations; „Istoric” (each past set: date, goal and horizon, its recommendations with a badge per chosen/confirmed method), newest first. Empty states for no set / no methods.

## Tests
Unit (`src/lib/plans.ts`): snapshot equality; push vs replace; drop methods no longer recommended on replace; toggle/confirm/unconfirm/remove; current/history split and order; cap at 20; storage v8 parsing drops malformed generations/methods and unknown ids. E2E: generate → choose two → portal counts → confirm one → change profile → stale notice → regenerate → previous set with its confirmed method in history, new set current; persists across reload.
