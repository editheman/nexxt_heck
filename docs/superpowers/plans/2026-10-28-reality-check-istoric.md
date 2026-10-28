# Plan — Reality Check pe date istorice INS/BNR + echivalențe tangibile

Aliniază aplicația cu CLAUDE.md §3, §4, §7.B, §8 (versiunea din 2026-10-28).

## Decizii
- **Date:** `src/content/macro-ro.ts` — indicii IPC medii anuali INS (an precedent = 100), 2015–2025, și cursurile medii anuale EUR/RON BNR (media celor 12 medii lunare) pentru anii de bază și 2025. Valorile EUR au fost recalculate din mediile lunare BNR și coincid cu cele publicate de BNR (ex. 2025: 5,0415).
- **Ferestre:** ultimii 3 / 5 / 10 ani compleți (2023–2025, 2021–2025, 2016–2025). Produsul indicilor medii anuali compară nivelul mediu al prețurilor din 2025 cu cel din anul de bază (2022 / 2020 / 2015).
- **Suma:** economiile din profil, presupuse ținute fără dobândă. Nu inventăm dobânzi istorice. `P_real = P / ∏(1+i_t)`, `Δ = P − P_real`.
- **Echivalențe:** catalog tipizat `src/content/equivalents.ts` (prețuri orientative din CLAUDE.md); `src/lib/equivalents.ts` alege 2–3 bunuri din treapta pierderii, completează din treapta inferioară, `Cantitate = ⌊Δ / preț⌋`, iar vila din Pipera apare ca procent. Plurale corecte cu `formatCount`.
- **Fără slider de inflație în Reality Check.** Proiecțiile cu inflație presupusă rămân doar în Simulator (implicit 5%, ipoteză).
- **Stocare:** `pcac:v2` adaugă `reality.years` (3|5|10, implicit 5); `pcac:v1` este migrat la citire.

## Pași
1. Date + funcții pure (`historicalInflation`, `eurConversion`) în `finance.ts`; teste: produs, fereastră invalidă, sumă 0, indice neutru.
2. Catalog + `pickEquivalents` + `formatCount`; teste: scalare pe trepte, pierdere 0/negativă, preț > 0, plurale (1, 4, 15, 20, 101, 1.234).
3. Stocare v2 + migrare v1; teste: round-trip, migrare, fereastră invalidă → implicit.
4. UI Reality Check: selector de fereastră (radiogroup), carduri (Datele tale / Date oficiale / Estimare), conversie EUR, secțiunea „Ce puteai cumpăra cu banii mâncați de inflație”, „Cum am calculat” cu surse și perioade.
5. Copy: landing, antet pagină, spec, design system (badge „Date oficiale”).
6. E2E: valorile pe 5 ani, schimbarea ferestrei actualizează pierderea și echivalențele, persistă la reload; simulatorul pornește de la 5%.
7. `npm run verify`, `npm run test:e2e`.
