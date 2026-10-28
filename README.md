# Protejează ce ai construit

O aplicație web educațională, în limba română, care te ajută să înțelegi cum îți afectează inflația economiile, să explorezi scenarii ipotetice transparente, să recunoști fraudele financiare și să-ți verifici cunoștințele.

> Proiect educațional. Nu este bancă, broker sau consultant de investiții. Nu folosește date de piață în timp real și nu oferă recomandări personalizate.

## Pornire

```bash
npm install
npm run dev            # http://localhost:3000
```

Verificări:

```bash
npm run verify         # eslint + tsc + vitest + next build
npx playwright install chromium   # o singură dată
npm run test:e2e       # parcursul complet, desktop + mobil
```

Necesită Node.js 20.9+ (testat cu Node 26). Nu are nevoie de chei API sau servicii externe.

## Parcursul principal

Profilare ghidată: `/profil` (2 pași) → `/reality-check` → `/simulator` → `/portal`. După profilare, toate secțiunile se deschid din portal (nu mai sunt înlănțuite), iar Învață apare ca opțiune acolo. Învață și portalul recomandă modulele după obiectivul de economisire ales în profil. Profilarea începe cu crearea unui cont (nume de utilizator + parolă); `/intra` este pagina de autentificare, iar iconița din dreapta sus deschide meniul contului. Conturile sunt **locale, de demo**: parola nu se salvează, ci doar un hash PBKDF2-SHA-256 cu sare, iar datele fiecărui cont stau separat în browser. Pentru conturi reale e nevoie de server — vezi `docs/superpowers/specs/2026-10-28-accounts-design.md`.


| Pas | Rută | Ce face |
|---|---|---|
| Intrare | `/` | Promisiunea produsului, „Începe demo-ul” sau „Folosește un profil exemplu” (fictiv) |
| 1 | `/profil` | Profil minim: economii, unde sunt ținute, randament estimat de tine, depunere lunară, orizont, obiectiv |
| 2 | `/reality-check` | Valoare nominală vs. putere de cumpărare în lei de azi; inflația este o ipoteză editabilă |
| 3 | `/simulator` | Glisoare + câmpuri numerice, scenarii rapide, grafic (nominal continuu / real întrerupt) și tabel |
| 4 | `/invata`, `/invata/[slug]` | 7 module: inflație, randament real, lichiditate, diversificare, comisioane, taxe, fraude |
| Quiz | `/invata/[slug]/quiz` | Feedback la fiecare răspuns, link către secțiunea de recitit, reluarea doar a întrebărilor greșite |
| Progres | `/progres` | Traseu, module, scoruri, resetare cu confirmare; totul persistă la reîncărcare |

## Recomandări de categorii de produse (varianta A)

`/recomandari` ordonează categoriile (cont de economii, depozit, Tezaur, Fidelis, ETF pe BET, ETF global cu acumulare, Pilonul III) după profil și trei răspunsuri despre risc. Regulile din `src/lib/productFit.ts` exclud categoriile nepotrivite (de exemplu acțiuni pe orizont scurt). Opțional, un model compatibil OpenAI (de exemplu Featherless) ordonează și formulează motivele: copiază `.env.example` în `.env.local` și completează `AI_API_KEY` și `AI_MODEL`. Fără cheie, se folosește clasamentul din reguli. Răspunsul modelului este validat (doar categorii permise, fără cifre sau promisiuni). Nu se recomandă produse, fonduri sau instituții anume.

## Metodele mele

Din `/recomandari` poți alege categorii („Aleg această metodă”) — apar ca draft în `/metode`, unde le confirmi pe cele pe care le folosești. Recomandările se salvează în cont; când îți schimbi profilul sau răspunsurile și generezi din nou, setul vechi, cu metodele alese din el, trece în istoric (cel mai nou primul), iar setul nou devine cel actual.

## Calcule și ipoteze

- Valoare nominală: `P × (1 + r)^n`; depunerile lunare la **sfârșitul** fiecărei luni, cu rata lunară echivalentă `(1 + r)^(1/12) − 1`.
- Putere de cumpărare: `nominal / (1 + i)^n`. Randament real: `(1 + r) / (1 + i) − 1` (exact, nu `r − i`).
- Inflația implicită de **5%/an este o ipoteză ilustrativă**, marcată ca atare și modificabilă; utilizatorul este trimis la INS pentru date oficiale.
- Randamentul implicit este **0%** pentru orice plasament: aplicația nu completează rate de piață.
- Fiecare cifră are o etichetă de proveniență: *Datele tale*, *Ipoteză*, *Estimare*, *Exemplu fictiv*.

## Arhitectură

- Next.js 16 (App Router, Cache Components), TypeScript strict, Tailwind CSS v4, Recharts, lucide-react.
- `src/lib/` — logică pură, testată: `finance`, `format`, `storage`, `quiz`, `progress`, `explain`.
- `src/content/` — conținutul în limba română, ca date tipizate.
- `src/components/` — primitive UI accesibile și componente pe funcționalități; `src/app/` — rutele.
- Starea demo: un singur obiect versionat în `localStorage` (`pcac:v1`), citit cu `useSyncExternalStore`; datele corupte revin la valorile implicite.
- `src/proxy.ts` întoarce 404 real pentru module inexistente (cu Cache Components, `dynamicParams` nu este disponibil).

## Decizii luate în lipsa unor cerințe explicite

- Componente UI scrise manual în loc de shadcn/ui, pentru mai puține dependențe la această dimensiune.
- Simulatorul pornește de la profil, dar modificările din el nu suprascriu profilul; doar inflația din Reality Check se salvează.
- Un quiz este „trecut” la ≥ 75%. La reluarea întrebărilor greșite, cele corecte anterior rămân corecte.
- Sumele se afișează ca „12.346 lei” (convenția obișnuită în interfețele financiare); anii respectă acordul („10 ani”, „20 de ani”).

## Limitări cunoscute

- Funcția opțională „Prieteni” (comparații de progres pe bază de alias) nu este implementată.
- Fără mod întunecat; fără export de rezultate.
- Calculele ignoră costurile și impozitele (explicat în aplicație); ratele sunt constante pe toată perioada.
