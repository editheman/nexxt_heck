/**
 * The seven product categories the app talks about. Facts verified 2026-10-28 (see
 * docs/superpowers/specs/2026-10-28-products-design.md). No interest rates, returns, fees or tax
 * rates as numbers — they change; the UI points to the official source instead (a test enforces it).
 * Named funds are examples of a category, never recommendations.
 */

export const PRODUCT_IDS = ["cont-economii", "depozit", "tezaur", "fidelis", "etf-bet", "etf-global", "pilon3"] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

type Level = 1 | 2 | 3 | 4 | 5;

export type Product = {
  id: ProductId;
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

export const PRODUCTS: Product[] = [
  {
    id: "cont-economii",
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
    id: "depozit",
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
    id: "tezaur",
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
    id: "etf-bet",
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
];

export const productById = (id: ProductId) => PRODUCTS.find((p) => p.id === id)!;
