# Plan — aliniere cu CLAUDE.md (pâlnia progresivă, fapte validate cu Zod, `pcac:v1`, prieteni)

Continuă `2026-10-28-reality-check-istoric.md` (date INS/BNR + echivalențe, deja implementat).

## Goluri identificate față de CLAUDE.md
| § | Cerință | Stare înainte |
|---|---------|---------------|
| 3.1–3.3 | Ticker macro, chip-uri „În ce domeniu activezi?”, insight pe sector, expandare inline cu slidere (venit + economii) | lipsă — landing clasic |
| 4, 6 | `src/content/dynamic-facts.json` validat de `src/lib/schemas/facts.ts` (Zod), generat la build, cu fallback static | lipsă; Zod doar dependență tranzitivă |
| 6 | Persistență sub cheia `pcac:v1` | WIP mutase cheia pe `pcac:v2` |
| 3.3 | Venit net lunar aproximativ în profil | lipsă |
| 3.7 | Alias opțional + comparație de progres educațional cu prietenii | lipsă |

## Decizii
- **Fapte = calcul, nu text inventat.** `scripts/build-facts.ts` (rulat cu `npm run facts:build`) combină seriile oficiale din `macro-ro.ts` cu inputurile verificate din `src/content/sector-sources.ts` (fiecare cifră are sursă) prin funcția pură `buildFacts` din `src/lib/facts-builder.ts` și scrie JSON-ul validat. Fără apeluri LLM la runtime. Un test unitar cere ca JSON-ul din repo să fie identic cu ce generează scriptul (nu poate rămâne învechit).
- **Fallback:** `src/content/facts.ts` validează JSON-ul cu `safeParse`; la eșec folosește `buildFacts(...)` direct din datele statice.
- **Sectoare fără cifră oficială verificată** (Sănătate, Corporate, Construcții, Freelancer): insight calculat doar din IPC/curs BNR și media pe economie, etichetat ca atare. Nu inventăm salarii sectoriale.
- **Schema respinge diacriticele cu sedilă** (ş/ţ) în orice text.
- **Stocare:** cheia rămâne `pcac:v1`; câmpul intern `version: 2` permite migrarea stărilor vechi. Adăugăm `industry`, `profile.income` (opțional, `null`) și `social { alias, friends }`.
- **Home:** pâlnia inline (fără modale). Rezultatul instant pe 5 ani apare direct sub slidere; CTA „Vezi calculul complet” salvează profilul și duce la Reality Check.
- **Prieteni:** cod de partajare `PCAC1.<base64url(JSON)>` care conține doar alias + procente/numărători de progres educațional. Validat cu Zod la import. Nicio cifră financiară.
- **shadcn/ui:** primitivele existente (Button, Card, Badge…) rămân; migrarea nu aduce valoare vizibilă și ar destabiliza componente testate.

## Pași
1. Dependențe: `zod`, `tsx` (dev); script `facts:build`.
2. Schema + builder + JSON + loader; teste (validare, diacritice, fallback, sincronizare JSON).
3. Stocare: cheie `pcac:v1`, câmpuri noi, migrare; teste.
4. Home: `MacroTicker`, `IndustryFunnel` (chips → insight → slidere → rezultat instant).
5. Profil: câmp venit; Reality Check: „≈ N salarii nete”.
6. Progres: secțiunea „Compară cu prietenii”; `src/lib/friends.ts` + teste.
7. E2E: pâlnia pe home (desktop + mobil), prieteni; `npm run verify`, `npm run test:e2e`.
