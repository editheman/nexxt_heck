/**
 * The seven product categories the app talks about. Facts verified 2026-10-28 (see
 * docs/superpowers/specs/2026-10-28-products-design.md). No interest rates, returns, fees or tax
 * rates as numbers — they change; the UI points to the official source instead (a test enforces it).
 * Named funds are examples of a category, never recommendations.
 */

export const PRODUCT_IDS = [
  "cont-economii",
  "rambursare-credit",
  "depozit",
  "fonduri-deschise",
  "economii-euro",
  "tezaur",
  "fidelis",
  "obligatiuni-corporative",
  "etf-bet",
  "etf-global",
  "pilon3",
  "aur",
  "actiuni",
  "unit-linked",
  "cripto",
  "pilon2",
  "imobiliare",
] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

type Level = 1 | 2 | 3 | 4 | 5;

/**
 * consider — can be suggested when the fit rules allow it;
 * caution  — explained, never suggested (high risk, high cost or frequent scams);
 * check    — something to verify or a decision of another scale, not a product to compare.
 */
export type ProductKind = "consider" | "caution" | "check";

export type Product = {
  id: ProductId;
  kind: ProductKind;
  name: string;
  short: string;
  what: string;
  risk: { level: Level; text: string };
  liquidity: { level: Level; text: string };
  horizon: string;
  protection: string;
  costs: string;
  tax: string;
  where: string;
  /** Questions to ask / things to verify before signing. */
  checks: string[];
  sources: Array<{ name: string; url: string }>;
};

const FGDB = { name: "FGDB — Fondul de Garantare a Depozitelor Bancare", url: "https://www.fgdb.ro" };
const MF = { name: "Ministerul Finanțelor — titluri de stat", url: "https://mfinante.gov.ro" };
const BVB = { name: "Bursa de Valori București", url: "https://bvb.ro" };
const ASF = { name: "ASF — Autoritatea de Supraveghere Financiară", url: "https://asfromania.ro" };
const ANAF = { name: "ANAF — reguli fiscale actuale", url: "https://www.anaf.ro" };
const BNR = { name: "BNR — Banca Națională a României", url: "https://www.bnr.ro" };
const ANPC = { name: "ANPC — Protecția Consumatorilor", url: "https://anpc.ro" };
const LEG = { name: "Legislație (OUG 50/2010 privind creditele pentru consumatori)", url: "https://legislatie.just.ro" };
const ESMA = { name: "ESMA — registrul furnizorilor de servicii cripto (MiCA)", url: "https://www.esma.europa.eu" };
const ASF_DATA = { name: "ASF — verifică fondul tău de pensii", url: "https://data.asfromania.ro" };

export const PRODUCTS: Product[] = [
  {
    id: "cont-economii",
    kind: "consider",
    name: "Cont de economii",
    short: "Bani disponibili oricând, cu o dobândă variabilă.",
    what: "Un cont la bancă în care banii primesc o dobândă stabilită de bancă, pe care o poate schimba. Poți retrage sau adăuga bani de regulă oricând, fără să pierzi dobânda acumulată.",
    risk: { level: 1, text: "Risc foarte scăzut de pierdere nominală; dobânda poate fi sub inflație, deci puterea de cumpărare poate scădea." },
    liquidity: { level: 5, text: "Foarte lichid: banii sunt disponibili imediat." },
    horizon: "Orice orizont; potrivit mai ales pentru fondul de urgență și pentru bani de care ai nevoie curând.",
    protection: "Garantat de FGDB până la echivalentul în lei a 100.000 de euro per deponent, per bancă.",
    costs: "Pot exista comisioane de administrare sau de retragere — verifică lista de tarife a băncii.",
    tax: "Dobânda bancară se impozitează, de regulă reținut la sursă de bancă; verifică regulile actuale la ANAF.",
    where: "La orice bancă autorizată în România.",
    checks: ["Dobânda e fixă sau variabilă și cum se modifică?", "Există comisioane de administrare sau de retragere?", "Banca participă la FGDB?"],
    sources: [FGDB, ANAF],
  },
  {
    id: "rambursare-credit",
    kind: "consider",
    name: "Rambursarea anticipată a unui credit scump",
    short: "Plătești mai devreme un credit cu dobândă mare și economisești dobânda.",
    what: "Nu e un produs de investiții, ci folosirea economiilor ca să reduci sau să închizi un credit scump (card de credit, credit de nevoi personale). Câștigul este dobânda pe care nu o mai plătești — sigur, spre deosebire de randamentul unei investiții.",
    risk: { level: 1, text: "Fără risc de piață; riscul este să rămâi fără rezervă dacă folosești și fondul de urgență." },
    liquidity: { level: 1, text: "Banii folosiți pentru rambursare nu mai sunt disponibili; păstrează separat fondul de urgență." },
    horizon: "Imediat; are sens mai ales când dobânda creditului este mare.",
    protection: "Legea îți dă dreptul la rambursare anticipată; la creditele cu dobândă variabilă banca nu poate cere compensație, iar la cele cu dobândă fixă compensația este plafonată.",
    costs: "Eventuala compensație pentru rambursare anticipată (doar la dobânda fixă, în limitele legii) — verifică în contract.",
    tax: "Nu se aplică impozit pe dobânda economisită.",
    where: "La banca sau instituția financiară care ți-a dat creditul.",
    checks: ["Ce dobândă are creditul (inclusiv costul total, DAE)?", "Dobânda este fixă sau variabilă și ce compensație se aplică?", "Rămâi cu un fond de urgență după rambursare?"],
    sources: [LEG, ANPC, BNR],
  },
  {
    id: "depozit",
    kind: "consider",
    name: "Depozit la termen",
    short: "Dobândă stabilită pentru o perioadă fixă, cu acces limitat la bani.",
    what: "Blochezi o sumă la bancă pentru o perioadă (de exemplu 3, 6 sau 12 luni), iar banca plătește o dobândă stabilită la constituire. Dacă retragi înainte de termen, de obicei pierzi dobânda.",
    risk: { level: 1, text: "Risc foarte scăzut de pierdere nominală; dobânda poate rămâne sub inflație." },
    liquidity: { level: 3, text: "Lichiditate redusă până la scadență: retragerea anticipată costă de regulă dobânda." },
    horizon: "De la câteva luni la câțiva ani, pentru bani de care știi când vei avea nevoie.",
    protection: "Garantat de FGDB până la echivalentul în lei a 100.000 de euro per deponent, per bancă.",
    costs: "De regulă fără comision de constituire; verifică penalizările la lichidare anticipată.",
    tax: "Dobânda se impozitează, de regulă reținut la sursă; verifică regulile actuale la ANAF.",
    where: "La orice bancă autorizată în România.",
    checks: ["Ce se întâmplă cu dobânda dacă retrag mai devreme?", "Se prelungește automat la scadență și cu ce dobândă?", "Banca participă la FGDB?"],
    sources: [FGDB, ANAF],
  },
  {
    id: "fonduri-deschise",
    kind: "consider",
    name: "Fonduri deschise de investiții (monetare, de obligațiuni, mixte)",
    short: "Fonduri administrate de o SAI, din care cumperi și răscumperi unități direct.",
    what: "Fonduri administrate de o societate de administrare a investițiilor (SAI) autorizată de ASF. Fondurile monetare investesc în instrumente pe termen foarte scurt (o alternativă la depozit), cele de obligațiuni în titluri de datorie, iar cele mixte combină obligațiuni și acțiuni. Nu se tranzacționează la bursă: cumperi și răscumperi unități de la administrator.",
    risk: { level: 2, text: "Scăzut pentru fondurile monetare, mai mare pentru cele de obligațiuni și mixte; valoarea unității poate scădea și nu este garantată." },
    liquidity: { level: 4, text: "Poți răscumpăra în general oricând; banii ajung de regulă în câteva zile lucrătoare (vezi prospectul)." },
    horizon: "Monetare: de la câteva luni; obligațiuni și mixte: de regulă câțiva ani.",
    protection: "Nu sunt garantate de FGDB. Fondul și SAI-ul sunt autorizate și supravegheate de ASF.",
    costs: "Comision anual de administrare și, uneori, comisioane de subscriere sau răscumpărare — vezi KID-ul și prospectul.",
    tax: "Câștigurile se impozitează, iar regulile s-au schimbat din 2026 — verifică regimul actual la ANAF sau în nota SAI.",
    where: "Direct la SAI, online sau prin bănci distribuitoare.",
    checks: ["Ce tip de fond este (monetar, obligațiuni, mixt) și ce deține?", "Ce costuri are (din KID)?", "În câte zile primești banii la răscumpărare?"],
    sources: [ASF, ANAF],
  },
  {
    id: "economii-euro",
    kind: "consider",
    name: "Economii în euro",
    short: "O parte din economii în euro, ca să nu depinzi doar de leu.",
    what: "Cont de economii, depozit sau titluri de stat Fidelis în euro. Pot fi utile dacă ai cheltuieli viitoare în euro (de exemplu o locuință cu preț în euro) sau vrei să nu ai toate economiile într-o singură monedă.",
    risk: { level: 2, text: "Risc valutar în ambele sensuri: dacă leul se apreciază, valoarea în lei scade. Dobânzile la euro pot fi diferite de cele la lei." },
    liquidity: { level: 4, text: "Depinde de produs: contul e lichid, depozitul și titlurile până la scadență." },
    horizon: "Orice orizont; are sens mai ales când cheltuiala viitoare este în euro.",
    protection: "Depozitele în euro sunt garantate de FGDB în aceeași limită (echivalentul în lei a 100.000 de euro per deponent, per bancă); Fidelis în euro este obligație a statului.",
    costs: "Atenție la cursul de schimb al băncii (diferența dintre cumpărare și vânzare) și la comisioanele de conversie.",
    tax: "Dobânda bancară se impozitează; la Fidelis, dobânda nu se impozitează — verifică la ANAF.",
    where: "La bănci autorizate sau prin intermediarii ofertei Fidelis.",
    checks: ["Ce curs de schimb aplică banca la conversie?", "Cheltuiala ta viitoare este în lei sau în euro?", "Ce dobândă are produsul în euro?"],
    sources: [FGDB, MF, BNR],
  },
  {
    id: "tezaur",
    kind: "consider",
    name: "Titluri de stat Tezaur",
    short: "Împrumuți statul român pentru 1–5 ani; dobânda nu se impozitează.",
    what: "Titluri de stat emise de Ministerul Finanțelor doar pentru persoane fizice, de regulă cu maturități de 1, 3 și 5 ani și dobândă fixă plătită anual. Dobânda diferă de la o ediție la alta.",
    risk: { level: 1, text: "Risc foarte scăzut: emitentul este statul român. Dobânda fixă poate fi sub inflație dacă inflația crește." },
    liquidity: { level: 2, text: "Gândite pentru a fi ținute până la scadență; verifică în prospect condițiile de răscumpărare anticipată." },
    horizon: "1–5 ani, potrivit pentru bani de care nu ai nevoie până la scadență.",
    protection: "Obligație a statului român (nu intră sub garanția FGDB, care acoperă depozitele bancare).",
    costs: "De regulă fără comisioane la subscriere; verifică prospectul ediției.",
    tax: "Veniturile din dobândă nu se impozitează și nu datorezi CASS pe ele, conform Codului fiscal — verifică la ANAF.",
    where: "Online prin Ghișeul.ro sau SPV (ANAF), la unitățile Trezoreriei și prin alte canale anunțate pentru fiecare ediție.",
    checks: ["Care este perioada de subscriere și dobânda ediției curente?", "Pot răscumpăra înainte de scadență și cu ce cost?", "Cum și când se plătește dobânda?"],
    sources: [MF, ANAF],
  },
  {
    id: "fidelis",
    kind: "consider",
    name: "Titluri de stat Fidelis",
    short: "Titluri de stat listate la bursă, în lei sau euro; pot fi vândute înainte de scadență.",
    what: "Titluri de stat pentru persoane fizice de peste 18 ani, emise în lei și în euro și listate la Bursa de Valori București. Le poți ține până la scadență sau le poți vinde la bursă înainte, la prețul pieței.",
    risk: { level: 2, text: "Risc scăzut dacă le ții până la scadență; dacă vinzi înainte, prețul de pe bursă poate fi mai mic. Emisiunile în euro au și risc valutar." },
    liquidity: { level: 3, text: "Pot fi vândute la bursă înainte de scadență, la prețul de pe piață." },
    horizon: "De la 1 an la mai mulți ani, în funcție de emisiune.",
    protection: "Obligație a statului român (nu intră sub garanția FGDB).",
    costs: "Comisioanele intermediarului (bancă sau broker) la subscriere și la vânzarea pe bursă.",
    tax: "Dobânda și câștigul din vânzare nu se impozitează, conform comunicatelor BVB și Codului fiscal — verifică la ANAF.",
    where: "Prin intermediarii din sindicatul ofertei (bănci și brokeri) în perioada de subscriere, apoi la BVB.",
    checks: ["În ce monedă este emisiunea și ce maturitate are?", "Ce comisioane percepe intermediarul?", "Cât de ușor pot vinde înainte de scadență?"],
    sources: [MF, BVB, ANAF],
  },
  {
    id: "obligatiuni-corporative",
    kind: "consider",
    name: "Obligațiuni corporative și municipale (BVB)",
    short: "Împrumuți o companie sau o primărie pe o perioadă stabilită, pentru o dobândă.",
    what: "Titluri de datorie emise de companii sau de autorități locale și listate la Bursa de Valori București. Primești dobândă (cupon) și, la scadență, suma împrumutată, dacă emitentul își poate plăti datoria.",
    risk: { level: 3, text: "Risc de emitent: dacă emitentul are probleme, poți pierde din bani. Prețul la bursă variază, iar unele emisiuni se vând greu." },
    liquidity: { level: 2, text: "Se pot vinde la bursă, dar multe emisiuni au tranzacții rare." },
    horizon: "De regulă câțiva ani, până la scadența emisiunii.",
    protection: "Nu sunt garantate de FGDB și nici de stat (cu excepția garanțiilor specifice emisiunii).",
    costs: "Comisioanele brokerului; diferența dintre prețul de cumpărare și cel de vânzare.",
    tax: "Dobânda și câștigurile pot fi impozitate diferit în funcție de emitent — verifică la ANAF.",
    where: "Printr-un broker autorizat de ASF, la BVB.",
    checks: ["Cine este emitentul și cât de solid este financiar?", "Ce scadență și ce cupon are emisiunea?", "Cât de des se tranzacționează?"],
    sources: [BVB, ASF, ANAF],
  },
  {
    id: "etf-bet",
    kind: "consider",
    name: "ETF pe indicele BET",
    short: "Un fond listat la bursă care urmărește cele mai mari companii românești.",
    what: "Un fond tranzacționat la bursă care replică indicele BET, format din cele mai mari 20 de companii listate la Bursa de Valori București. Un exemplu din această categorie este ETF BET Patria-TradeVille (simbol TVBETETF).",
    risk: { level: 4, text: "Valoarea urcă și coboară odată cu acțiunile companiilor; poți pierde o parte din bani. Expunere concentrată pe economia României." },
    liquidity: { level: 4, text: "Se poate vinde în zilele de tranzacționare, la prețul pieței." },
    horizon: "Cel puțin 5 ani; pe perioade scurte, scăderile sunt frecvente.",
    protection: "Nu este garantat. Fondul este supravegheat de ASF, dar valoarea investiției nu e protejată.",
    costs: "Costurile anuale ale fondului (din KID) plus comisioanele brokerului.",
    tax: "Câștigurile și dividendele pot fi impozitate; verifică regulile actuale la ANAF.",
    where: "Prin un broker autorizat de ASF, cu cont de tranzacționare la BVB.",
    checks: ["Ce costuri curente are fondul (în KID)?", "Ce comisioane are brokerul?", "Brokerul apare în registrul ASF?"],
    sources: [BVB, ASF, ANAF],
  },
  {
    id: "etf-global",
    kind: "consider",
    name: "ETF global cu acumulare",
    short: "Un fond diversificat la nivel mondial care reinvestește automat dividendele.",
    what: "Un fond tranzacționat la bursă care urmărește un indice global de acțiuni (mii de companii din multe țări). Varianta „cu acumulare” nu plătește dividende, ci le reinvestește în fond.",
    risk: { level: 4, text: "Valoarea poate scădea mult pe termen scurt. Diversificarea globală reduce riscul unei singure țări, dar nu și riscul pieței. Este de obicei în altă monedă decât leul, deci are și risc valutar." },
    liquidity: { level: 4, text: "Se poate vinde în zilele de tranzacționare, la prețul pieței." },
    horizon: "Cel puțin 7–10 ani pentru a trece prin ciclurile pieței.",
    protection: "Nu este garantat. Fondurile UCITS din UE au reguli de diversificare și informare, dar valoarea nu e protejată.",
    costs: "Costurile anuale ale fondului (din KID), comisioanele brokerului și costul schimbului valutar.",
    tax: "Câștigul la vânzare poate fi impozitat; verifică regulile actuale la ANAF.",
    where: "Prin un broker autorizat de ASF sau de autoritatea unui alt stat UE și notificat pentru România.",
    checks: ["Fondul este UCITS și cu acumulare?", "În ce monedă este listat și cât costă schimbul valutar?", "Brokerul este autorizat sau notificat la ASF?"],
    sources: [ASF, ANAF],
  },
  {
    id: "pilon3",
    kind: "consider",
    name: "Fond de pensii facultative (Pilonul III)",
    short: "Economisire pe termen lung pentru pensie, cu deducere fiscală.",
    what: "Un fond administrat de o companie autorizată de ASF în care contribui voluntar. Banii sunt investiți (de regulă mai ales în titluri de stat și o parte în acțiuni) și pot fi retrași, ca regulă, după vârsta de 60 de ani.",
    risk: { level: 2, text: "Risc scăzut spre mediu, în funcție de profilul fondului; valoarea unității de fond poate scădea temporar." },
    liquidity: { level: 1, text: "Foarte redusă: banii sunt destinați pensiei; retragerea înainte de 60 de ani este posibilă doar în situații prevăzute de lege." },
    horizon: "Până la pensie; potrivit pentru orizonturi lungi.",
    protection: "Fondurile și administratorii sunt autorizați și supravegheați de ASF; valoarea investiției nu e garantată.",
    costs: "Comision din contribuții și comision anual de administrare — vezi prospectul fondului.",
    tax: "Contribuțiile sunt deductibile în limita a 400 de euro pe an; condițiile exacte de retragere și de impozitare la ASF și ANAF.",
    where: "Direct la un administrator autorizat de ASF sau prin angajator.",
    checks: ["Ce grad de risc are fondul ales?", "Ce comisioane percepe administratorul?", "Care sunt condițiile actuale de retragere?"],
    sources: [ASF, ANAF],
  },
  {
    id: "aur",
    kind: "caution",
    name: "Aur (lingouri, monede sau fonduri pe aur)",
    short: "Privit ca protecție față de inflație, dar volatil și fără dobândă.",
    what: "Aur fizic de investiții (lingouri, monede) sau instrumente listate care urmăresc prețul aurului. Aurul nu plătește dobândă sau dividende: câștigul vine doar din schimbarea prețului.",
    risk: { level: 4, text: "Prețul poate scădea mult și pe perioade lungi; în lei depinde și de cursul dolarului." },
    liquidity: { level: 3, text: "Aurul fizic se vinde cu o diferență între prețul de cumpărare și cel de vânzare; instrumentele listate, la bursă." },
    horizon: "Pe termen lung și doar ca parte mică din economii.",
    protection: "Nu există garanție. La aurul fizic ai și riscul păstrării (furt, contrafacere).",
    costs: "Diferența de preț la cumpărare/vânzare, păstrarea în siguranță; la fonduri, costurile din KID.",
    tax: "Aurul de investiții (lingouri și monede care respectă condițiile legale) este scutit de TVA în UE; câștigul la vânzare poate fi impozitat — verifică la ANAF.",
    where: "Comercianți autorizați, bănci, Monetăria Statului; instrumente listate prin broker.",
    checks: ["Vânzătorul este cunoscut și emite factură?", "Ce diferență este între prețul de cumpărare și cel de răscumpărare?", "Unde și cum îl păstrezi în siguranță?"],
    sources: [BNR, ANAF],
  },
  {
    id: "actiuni",
    kind: "caution",
    name: "Acțiuni individuale",
    short: "Devii coproprietar al unei companii; câștig sau pierdere după evoluția ei.",
    what: "Cumperi acțiuni ale unor companii anume, la BVB sau pe burse străine. Poți primi dividende, iar prețul urcă sau coboară în funcție de rezultatele companiei și de piață.",
    risk: { level: 5, text: "Risc foarte mare de concentrare: o singură companie poate pierde mult sau chiar dispărea. Pentru majoritatea oamenilor, un ETF diversificat este mai potrivit." },
    liquidity: { level: 4, text: "Acțiunile mari se vând ușor; cele mici, mai greu." },
    horizon: "Ani buni; necesită timp și cunoștințe pentru a analiza companiile.",
    protection: "Nu sunt garantate. Brokerul este supravegheat de ASF, dar valoarea acțiunilor nu e protejată.",
    costs: "Comisioanele brokerului la fiecare tranzacție; costuri de schimb valutar pe burse străine.",
    tax: "Dividendele și câștigurile se impozitează — verifică regulile actuale la ANAF.",
    where: "Printr-un broker autorizat de ASF.",
    checks: ["Ai deja o bază diversificată (de exemplu un ETF)?", "Înțelegi afacerea companiei și riscurile ei?", "Ce comisioane are brokerul?"],
    sources: [BVB, ASF, ANAF],
  },
  {
    id: "unit-linked",
    kind: "caution",
    name: "Asigurări de viață cu componentă de investiții (unit-linked)",
    short: "Asigurare de viață combinată cu investiții în fonduri — adesea cu costuri mari.",
    what: "O asigurare de viață în care o parte din prime este investită în fonduri. Combină protecția cu investiția, dar costurile pot fi mari și greu de comparat, iar retragerea în primii ani poate aduce pierderi importante.",
    risk: { level: 3, text: "Valoarea investită depinde de fondurile alese și nu este garantată; costurile reduc rezultatul." },
    liquidity: { level: 1, text: "Foarte redusă în primii ani: valoarea de răscumpărare poate fi mică sau chiar zero." },
    horizon: "Contractele sunt gândite pe termen foarte lung (adesea 15–20 de ani și peste).",
    protection: "Asigurătorul este supravegheat de ASF; valoarea componentei de investiții nu e garantată.",
    costs: "Comisioane din prime, de administrare a fondurilor, costul acoperirii de asigurare și penalizări la răscumpărare — toate în KID.",
    tax: "Verifică la ANAF regimul fiscal al sumelor încasate.",
    where: "La asigurători autorizați de ASF, direct sau prin brokeri de asigurare.",
    checks: ["Ce cost total arată KID-ul pe perioada recomandată?", "Ce valoare de răscumpărare are contractul în primii ani?", "Ai nevoie de asigurare de viață sau doar de economisire?"],
    sources: [ASF, ANAF],
  },
  {
    id: "cripto",
    kind: "caution",
    name: "Criptomonede",
    short: "Active digitale foarte volatile — și cea mai frecventă momeală în fraude.",
    what: "Active digitale precum bitcoin, tranzacționate pe platforme online. Nu sunt emise de o bancă centrală și nu au o valoare de bază; prețul depinde doar de cerere și ofertă.",
    risk: { level: 5, text: "Volatilitate extremă: valoarea poate scădea foarte mult în scurt timp. Multe „platforme de investiții cripto” sunt fraude." },
    liquidity: { level: 3, text: "Depinde de platformă; în perioade de criză, retragerile pot fi blocate." },
    horizon: "Nu există un orizont care să facă riscul previzibil.",
    protection: "Din 1 iulie 2026, în UE pot opera doar furnizorii autorizați conform regulamentului MiCA; la cei neautorizați nu ai protecțiile prevăzute de lege.",
    costs: "Comisioane de tranzacționare și de retragere, diferențe de preț pe platformă.",
    tax: "Câștigurile se impozitează — verifică regulile actuale la ANAF.",
    where: "Doar pe platforme autorizate MiCA (verifică în registrul ESMA).",
    checks: ["Platforma este autorizată conform MiCA?", "Ți s-a promis un câștig garantat sau ți s-a cerut să instalezi o aplicație? Atunci e fraudă.", "Îți permiți să pierzi toată suma?"],
    sources: [ESMA, ASF, ANAF],
  },
  {
    id: "pilon2",
    kind: "check",
    name: "Pilonul II de pensii (obligatoriu)",
    short: "Dacă ești salariat, probabil ai deja un fond — verifică la care.",
    what: "O parte din contribuția ta la pensie merge automat într-un fond de pensii administrat privat. Este obligatoriu pentru persoanele sub 35 de ani asigurate în sistemul public; dacă nu alegi un fond, ești repartizat automat.",
    risk: { level: 2, text: "Fondurile investesc mai ales în titluri de stat și o parte în acțiuni; valoarea poate varia." },
    liquidity: { level: 1, text: "Banii se primesc la pensionare, în condițiile legii." },
    horizon: "Până la pensie.",
    protection: "Fondurile și administratorii sunt autorizați și supravegheați de ASF.",
    costs: "Comisioane stabilite prin lege, prelevate de administrator — vezi informările fondului.",
    tax: "Contribuția face parte din contribuția la pensie (CAS).",
    where: "Nu se cumpără: verifici la ce fond ești pe portalul ASF.",
    checks: ["La ce fond de Pilon II ești înscris?", "Cât ai acumulat până acum?", "Ce randamente a avut fondul tău, comparativ cu celelalte?"],
    sources: [ASF_DATA, ASF],
  },
  {
    id: "imobiliare",
    kind: "check",
    name: "Imobiliare (locuință proprie sau de închiriat)",
    short: "O decizie de alt calibru: sumă mare, credit, lichiditate foarte mică.",
    what: "Cumpărarea unei locuințe, pentru tine sau ca să o închiriezi. Implică de obicei un avans și un credit ipotecar pe mulți ani, plus costuri de tranzacție și întreținere.",
    risk: { level: 3, text: "Prețurile pot scădea; chiria poate lipsi perioade; dobânda creditului poate crește dacă e variabilă." },
    liquidity: { level: 1, text: "Foarte redusă: vânzarea durează și are costuri mari." },
    horizon: "Mulți ani; nu e o alternativă la fondul de urgență.",
    protection: "Proprietatea e a ta, dar valoarea nu e garantată; creditul ipotecar rămâne de plătit.",
    costs: "Notar, taxe, comisioane bancare, evaluare, asigurare, întreținere, reparații.",
    tax: "Veniturile din chirii se impozitează — verifică la ANAF.",
    where: "Prin dezvoltatori, agenții sau direct de la proprietari; creditul de la o bancă.",
    checks: ["Ce cost total are creditul (DAE) pe toată durata?", "Ai un fond de urgență și după avans?", "Rata lunară rămâne suportabilă dacă dobânda crește?"],
    sources: [BNR, ANAF],
  },
];

export const productById = (id: ProductId) => PRODUCTS.find((p) => p.id === id)!;
