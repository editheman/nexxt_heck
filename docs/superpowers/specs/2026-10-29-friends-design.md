# Prieteni — compare purchasing power kept — Design

Date: 2026-10-29 · Branch `add-friends` · Requested by the owner.

- **Who:** every other account is a friend; no requests (owner). Accounts are local, so this means the accounts in this browser. Shown by default in the demo — no consent step (owner).
- **What is compared:** only `keptPct` = balance in today's lei / contributions in today's lei × 100, from each profile's savings, monthly saving and estimated return, the simulator inflation assumption, and a **common 10-year horizon** so percentages are comparable. Independent of the amounts' scale; never shows sums, savings, debt, goal or placement. Label: estimate, assumptions not forecasts. Trend: ≥ 100,5 % „Crește”, ≥ 99,5 % „Păstrează”, otherwise „Pierde”. Friends without a profile: „Nu și-a completat încă profilul.”
- **Order:** me first, then friends by % (highest first), those without a profile last.
- **Where:** logged in, every page of the `(app)` group (not the home page). From xl (1280 px) a rail fixed to the right edge under the header (`--friends-rail`, 300 px; `globals.css` pads `main` and `footer` while it exists; the recommendations bar stops before it). Below xl: a block after the page content.
- **Tests:** unit (`friends.test.ts`: formula, scale independence, nulls, ordering, no amounts); e2e (`friends.spec.ts`: hidden logged out and on home, friends appear automatically, no amounts, rail on the right edge without overlapping content).
