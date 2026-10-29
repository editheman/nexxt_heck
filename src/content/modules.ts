import type { LearningModule, Question } from "./types";

type Opt = [id: string, text: string, explanation: string];

function q(id: string, sectionId: string, prompt: string, correctId: string, options: Opt[]): Question {
  return { id, sectionId, prompt, correctId, options: options.map(([oid, text, explanation]) => ({ id: oid, text, explanation })) };
}

export const MODULES: LearningModule[] = [
  {
    slug: "inflatia",
    title: "Inflația și puterea de cumpărare",
    summary: "De ce aceeași sumă de bani cumpără mai puțin în timp și cum se calculează asta corect.",
    minutes: 6,
    tool: { href: "/reality-check", label: "Vezi efectul pe economiile tale" },
    sections: [
      {
        id: "ce-este",
        title: "Ce este inflația",
        body: [
          "Inflația este creșterea generală a prețurilor într-o economie, într-o anumită perioadă. Când prețurile cresc, fiecare leu cumpără ceva mai puțin decât înainte.",
          "În România, rata oficială a inflației este calculată de Institutul Național de Statistică (INS) pe baza indicelui prețurilor de consum — un „coș” de bunuri și servicii cumpărate frecvent de gospodării.",
          "Inflația ta personală poate fi diferită de cea oficială: dacă cheltui mai mult pe chirie sau alimente, iar acestea se scumpesc mai repede decât media, tu simți o inflație mai mare.",
        ],
      },
      {
        id: "nominal-vs-real",
        title: "Suma nominală și puterea de cumpărare",
        body: [
          "Suma nominală este numărul de lei pe care îl vezi în cont. Puterea de cumpărare arată ce poți cumpăra efectiv cu acei lei, exprimată în prețurile de azi.",
          "Exemplu ilustrativ: 10.000 lei ținuți 5 ani fără dobândă rămân 10.000 lei nominal. Dacă presupunem o inflație de 5% pe an, puterea lor de cumpărare ar fi de aproximativ 10.000 / 1,05⁵ ≈ 7.835 lei de azi.",
          "Banii nu „dispar” din cont — doar că, sub această ipoteză, aceeași sumă ar cumpăra mai puține lucruri.",
        ],
      },
      {
        id: "compunere",
        title: "De ce contează timpul",
        body: [
          "Inflația se compune: creșterea de anul acesta se aplică peste prețurile deja crescute de anul trecut. De aceea efectul pe 10 sau 20 de ani este mai mare decât simpla înmulțire a ratei cu numărul de ani.",
          "Formula folosită în această aplicație: valoarea în lei de azi = valoarea nominală / (1 + inflație)ⁿ, unde n este numărul de ani.",
        ],
      },
    ],
    takeaways: [
      "Inflația reduce puterea de cumpărare, nu suma nominală din cont.",
      "Efectul se compune în timp, deci orizontul contează mult.",
      "Pentru date reale, verifică rata oficială publicată de INS.",
    ],
    quiz: [
      q("inf-1", "ce-este", "Ce măsoară, în general, rata inflației?", "b", [
        ["a", "Cât câștigă o bancă din dobânzi", "Nu. Câștigul băncilor nu este o măsură a inflației."],
        ["b", "Creșterea generală a prețurilor într-o perioadă", "Corect. Inflația este creșterea generală a nivelului prețurilor."],
        ["c", "Cât de mult scade suma din contul tău", "Nu. Suma nominală din cont nu scade din cauza inflației; scade ce poți cumpăra cu ea."],
      ]),
      q("inf-2", "nominal-vs-real", "Ții 10.000 lei în numerar 5 ani. Ce se întâmplă cu suma nominală?", "a", [
        ["a", "Rămâne 10.000 lei", "Corect. Nominal ai tot 10.000 lei; se schimbă doar puterea lor de cumpărare."],
        ["b", "Scade automat cu rata inflației", "Nu. Inflația nu scoate bani din buzunar; scade ce poți cumpăra cu ei."],
        ["c", "Crește odată cu prețurile", "Nu. Numerarul nu produce dobândă și nu crește singur."],
      ]),
      q("inf-3", "compunere", "Cu o inflație ipotetică de 5%/an, de ce pierderea de putere de cumpărare pe 10 ani nu este exact 50%?", "c", [
        ["a", "Pentru că inflația scade în timp", "Nu. Calculul presupune o rată constantă."],
        ["b", "Pentru că băncile compensează pierderea", "Nu. Nimeni nu compensează automat efectul inflației."],
        ["c", "Pentru că efectul se compune: 1 / 1,05¹⁰ ≈ 0,61, adică o scădere de circa 39%", "Corect. Se împarte la (1 + i)ⁿ, nu se scade i × n."],
      ]),
      q("inf-4", "ce-este", "De ce inflația resimțită de tine poate fi diferită de cea oficială?", "b", [
        ["a", "Pentru că cifra oficială este mereu greșită", "Nu. Cifra oficială este o medie calculată după o metodologie publică."],
        ["b", "Pentru că structura cheltuielilor tale diferă de coșul mediu", "Corect. Dacă lucrurile pe care le cumperi tu se scumpesc mai repede, simți o inflație mai mare."],
        ["c", "Pentru că inflația se aplică doar celor care economisesc", "Nu. Creșterea prețurilor afectează pe toată lumea."],
      ]),
    ],
  },
  {
    slug: "randament-real",
    title: "Randament nominal vs. randament real",
    summary: "Cum compari corect o dobândă sau un randament cu inflația.",
    minutes: 5,
    tool: { href: "/simulator", label: "Încearcă în simulator" },
    sections: [
      {
        id: "definitii",
        title: "Nominal și real",
        body: [
          "Randamentul nominal este procentul anunțat: de exemplu, o dobândă de 6% pe an. Randamentul real arată cât crește, de fapt, puterea ta de cumpărare după ce ții cont de inflație.",
          "Un randament nominal pozitiv poate însemna un randament real negativ, dacă inflația este mai mare decât el.",
        ],
      },
      {
        id: "formula",
        title: "Formula corectă",
        body: [
          "Randamentul real exact se calculează astfel: (1 + randament nominal) / (1 + inflație) − 1.",
          "Exemplu ilustrativ: cu 10% nominal și 5% inflație, randamentul real este 1,10 / 1,05 − 1 ≈ 4,76%, nu exact 5%. Diferența „nominal minus inflație” este doar o aproximare, bună pentru valori mici.",
        ],
      },
      {
        id: "garantii",
        title: "Ipoteză, nu promisiune",
        body: [
          "Randamentele viitoare ale investițiilor nu sunt cunoscute dinainte. Orice simulare cu un randament fix este o ipoteză care te ajută să înțelegi mecanismul, nu o prognoză.",
          "Chiar și dobânzile fixe pot avea condiții: perioadă minimă, comisioane, taxe. Citește documentele produsului înainte să compari.",
        ],
      },
    ],
    takeaways: [
      "Compară întotdeauna randamentul cu inflația.",
      "Randament real = (1 + r) / (1 + i) − 1.",
      "Un randament ipotetic nu este o garanție.",
    ],
    quiz: [
      q("rr-1", "definitii", "O dobândă de 4%/an, cu o inflație ipotetică de 6%/an, înseamnă:", "c", [
        ["a", "Un câștig real de 4%", "Nu. 4% este randamentul nominal, înainte de inflație."],
        ["b", "Un câștig real de 10%", "Nu. Inflația nu se adună la randament."],
        ["c", "O scădere a puterii de cumpărare de aproximativ 1,9% pe an", "Corect. 1,04 / 1,06 − 1 ≈ −1,89%."],
      ]),
      q("rr-2", "formula", "Care este formula exactă a randamentului real?", "a", [
        ["a", "(1 + r) / (1 + i) − 1", "Corect. Aceasta este relația exactă (Fisher)."],
        ["b", "r × i", "Nu. Produsul celor două rate nu are această semnificație."],
        ["c", "r + i", "Nu. Inflația reduce randamentul real, nu îl crește."],
      ]),
      q("rr-3", "garantii", "Un simulator arată 8% randament pe an pentru 20 de ani. Cum ar trebui interpretat?", "b", [
        ["a", "Ca o estimare sigură a rezultatului", "Nu. Rezultatele viitoare nu sunt cunoscute; 8% este doar o ipoteză."],
        ["b", "Ca o ipoteză care ilustrează efectul compunerii", "Corect. Simularea arată mecanismul, nu un rezultat garantat."],
        ["c", "Ca o recomandare de investiție", "Nu. O simulare nu este o recomandare."],
      ]),
      q("rr-4", "formula", "Cu 10% nominal și 5% inflație, randamentul real exact este:", "b", [
        ["a", "Exact 5%", "Aproape, dar nu exact. Diferența simplă este doar o aproximare."],
        ["b", "Aproximativ 4,76%", "Corect. 1,10 / 1,05 − 1 ≈ 4,76%."],
        ["c", "15%", "Nu. Inflația se scade din randament, nu se adună."],
      ]),
    ],
  },
  {
    slug: "lichiditate",
    title: "Lichiditatea și fondul de urgență",
    summary: "Cât de repede poți folosi banii când ai nevoie de ei și de ce contează.",
    minutes: 5,
    sections: [
      {
        id: "ce-este",
        title: "Ce înseamnă lichiditate",
        body: [
          "Lichiditatea arată cât de repede și cu ce cost poți transforma un activ în bani disponibili. Banii din contul curent sunt foarte lichizi; o locuință sau un depozit cu penalizare la retragere sunt mai puțin lichide.",
          "De obicei există un compromis: produsele care oferă un randament potențial mai mare pot fi mai puțin lichide sau mai volatile.",
        ],
      },
      {
        id: "fond-urgenta",
        title: "Fondul de urgență",
        body: [
          "Un fond de urgență este o rezervă pentru situații neprevăzute: pierderea locului de muncă, o reparație, o problemă medicală. O regulă des întâlnită în educația financiară este acoperirea cheltuielilor esențiale pe 3–6 luni; potrivit pentru tine depinde de stabilitatea venitului și de obligații.",
          "Fondul de urgență trebuie să fie ușor accesibil și cu risc scăzut. Scopul lui principal este siguranța, nu randamentul.",
        ],
      },
      {
        id: "compromis",
        title: "Lichiditate vs. inflație",
        body: [
          "Banii foarte lichizi, fără dobândă, sunt expuși inflației. De aceea mulți oameni separă banii: o parte lichidă pentru urgențe, iar o parte pentru obiective pe termen lung, unde pot accepta mai puțină lichiditate.",
          "Nu există o împărțire corectă pentru toată lumea. Contează obiectivele, orizontul de timp și toleranța la risc.",
        ],
      },
    ],
    takeaways: [
      "Lichiditate = cât de repede ajungi la bani, fără pierderi mari.",
      "Fondul de urgență prioritizează siguranța și accesul rapid.",
      "Banii lichizi fără dobândă sunt expuși inflației.",
    ],
    quiz: [
      q("liq-1", "ce-este", "Care dintre următoarele este, de obicei, cel mai lichid?", "a", [
        ["a", "Banii din contul curent", "Corect. Îi poți folosi imediat, fără costuri de lichidare."],
        ["b", "Un apartament", "Nu. Vânzarea unei locuințe durează și implică costuri."],
        ["c", "Un depozit cu penalizare la retragerea anticipată", "Nu. Retragerea înainte de termen poate implica pierderea dobânzii."],
      ]),
      q("liq-2", "fond-urgenta", "Care este scopul principal al unui fond de urgență?", "c", [
        ["a", "Să obțină cel mai mare randament posibil", "Nu. Randamentul este secundar pentru un fond de urgență."],
        ["b", "Să fie investit în active volatile", "Nu. Volatilitatea poate face banii indisponibili exact când ai nevoie de ei."],
        ["c", "Să fie disponibil rapid, cu risc scăzut", "Corect. Siguranța și accesul rapid sunt prioritare."],
      ]),
      q("liq-3", "compromis", "Ce risc au banii lichizi ținuți fără dobândă pe termen lung?", "b", [
        ["a", "Nu pot fi retrași", "Nu. Tocmai faptul că pot fi retrași oricând îi face lichizi."],
        ["b", "Își pierd din puterea de cumpărare dacă există inflație", "Corect. Nominal rămân la fel, dar cumpără mai puțin."],
        ["c", "Sunt impozitați dublu", "Nu. Nu există o astfel de regulă generală."],
      ]),
      q("liq-4", "fond-urgenta", "Cât ar trebui să aibă exact fiecare persoană în fondul de urgență?", "c", [
        ["a", "Exact 6 salarii, pentru toată lumea", "Nu. Intervalul de 3–6 luni de cheltuieli este o regulă orientativă, nu o cifră universală."],
        ["b", "Nu are nevoie de un fond de urgență dacă are card de credit", "Nu. Creditul nu înlocuiește o rezervă și poate genera costuri mari."],
        ["c", "Depinde de cheltuieli, stabilitatea venitului și obligații", "Corect. Regula de 3–6 luni de cheltuieli esențiale este doar un punct de plecare."],
      ]),
    ],
  },
  {
    slug: "diversificare",
    title: "Diversificarea riscului",
    summary: "De ce nu e bine să pui toate economiile într-un singur loc.",
    minutes: 5,
    sections: [
      {
        id: "ce-este",
        title: "Ce este diversificarea",
        body: [
          "Diversificarea înseamnă împărțirea banilor între mai multe tipuri de active, emitenți sau piețe, astfel încât o problemă într-un singur loc să nu afecteze toate economiile.",
          "Diversificarea poate reduce riscul specific unei singure companii sau al unui singur produs, dar nu elimină riscul general al pieței.",
        ],
      },
      {
        id: "concentrare",
        title: "Riscul concentrării",
        body: [
          "Când toți banii sunt într-un singur activ, rezultatul tău depinde complet de el. Dacă acel activ scade puternic, nu ai nimic care să compenseze.",
          "Concentrarea apare și indirect: de exemplu, când lucrezi la o companie și îți ții și economiile în acțiunile ei, venitul și economiile depind de aceeași sursă.",
        ],
      },
      {
        id: "limite",
        title: "Limitele diversificării",
        body: [
          "Mai multe produse nu înseamnă automat diversificare: dacă toate depind de aceeași piață sau de același emitent, riscul rămâne concentrat.",
          "Diversificarea nu garantează profit și nu protejează complet împotriva pierderilor. Este un mod de a gestiona riscul, nu de a-l elimina.",
        ],
      },
    ],
    takeaways: [
      "Diversificarea împarte riscul, nu îl elimină.",
      "Atenție la concentrarea ascunsă (același emitent, aceeași piață).",
      "Niciun mix nu garantează profit.",
    ],
    quiz: [
      q("div-1", "ce-este", "Ce poate reduce diversificarea?", "a", [
        ["a", "Impactul problemelor unui singur activ asupra tuturor economiilor", "Corect. Riscul specific al unui activ este împărțit."],
        ["b", "Orice risc de pierdere", "Nu. Riscul general al pieței rămâne."],
        ["c", "Necesitatea de a înțelege produsele", "Nu. Trebuie să înțelegi fiecare produs în care pui bani."],
      ]),
      q("div-2", "limite", "Ai 5 produse diferite, toate legate de aceeași companie. Ești diversificat?", "b", [
        ["a", "Da, pentru că ai 5 produse", "Nu. Numărul de produse nu contează dacă depind de aceeași sursă."],
        ["b", "Nu, riscul rămâne concentrat pe aceeași companie", "Corect. Diversificarea reală înseamnă surse de risc diferite."],
        ["c", "Da, dacă le-ai cumpărat în ani diferiți", "Nu. Momentul cumpărării nu schimbă dependența de același emitent."],
      ]),
      q("div-3", "concentrare", "Care este un exemplu de concentrare ascunsă?", "c", [
        ["a", "Un fond de urgență în cont curent", "Nu. Acesta este un rol diferit, de lichiditate."],
        ["b", "Economii împărțite între mai multe tipuri de active", "Nu. Aceasta este diversificare."],
        ["c", "Economiile investite în acțiunile companiei la care lucrezi", "Corect. Venitul și economiile depind de aceeași companie."],
      ]),
      q("div-4", "limite", "Diversificarea garantează un profit?", "b", [
        ["a", "Da, pe termen lung", "Nu. Nicio strategie nu garantează profit."],
        ["b", "Nu, doar ajută la gestionarea riscului", "Corect. Diversificarea reduce dependența de un singur activ."],
        ["c", "Da, dacă incluzi cel puțin 10 active", "Nu. Numărul de active nu creează o garanție."],
      ]),
    ],
  },
  {
    slug: "comisioane",
    title: "Comisioanele și costurile",
    summary: "Cum comisioanele mici, aplicate an de an, reduc rezultatul final.",
    minutes: 5,
    tool: { href: "/simulator", label: "Compară scenarii în simulator" },
    sections: [
      {
        id: "tipuri",
        title: "Ce costuri pot exista",
        body: [
          "Produsele financiare pot avea comisioane de administrare, de tranzacționare, de retragere, de cont sau de transfer. Unele sunt exprimate în lei, altele ca procent din sumă.",
          "Costurile sunt descrise în documentele produsului (de exemplu, contract, prospect sau documentul cu informații esențiale). Citește-le înainte de a semna.",
        ],
      },
      {
        id: "efect",
        title: "Efectul în timp",
        body: [
          "Un comision anual procentual se aplică în fiecare an asupra întregii sume, inclusiv asupra câștigurilor acumulate. Pe orizonturi lungi, diferența dintre 0,5% și 2% pe an poate deveni semnificativă.",
          "Poți vedea efectul în simulator: scade randamentul nominal ipotetic cu valoarea comisionului anual și compară rezultatele.",
        ],
      },
      {
        id: "intrebari",
        title: "Întrebări utile",
        body: [
          "Care este costul total anual, exprimat ca procent? Există comisioane la intrare sau la ieșire? Ce se întâmplă dacă retrag banii mai devreme?",
          "Dacă cineva nu poate sau nu vrea să îți explice clar costurile, acesta este un semnal de atenție.",
        ],
      },
    ],
    takeaways: [
      "Comisioanele anuale se compun, la fel ca randamentul.",
      "Compară costul total, nu doar randamentul anunțat.",
      "Lipsa transparenței privind costurile este un semnal de alarmă.",
    ],
    quiz: [
      q("com-1", "efect", "De ce contează un comision anual de 2% pe termen lung?", "a", [
        ["a", "Pentru că se aplică în fiecare an asupra sumei acumulate", "Corect. Efectul se compune în timp."],
        ["b", "Nu contează, pentru că e un procent mic", "Nu. Pe 20–30 de ani, diferența poate fi mare."],
        ["c", "Pentru că se plătește o singură dată", "Nu. Un comision anual se plătește în fiecare an."],
      ]),
      q("com-2", "tipuri", "Unde găsești, de obicei, costurile unui produs financiar?", "b", [
        ["a", "Doar în reclame", "Nu. Reclamele pot omite detalii."],
        ["b", "În documentele produsului: contract, prospect, document cu informații esențiale", "Corect. Acolo sunt descrise oficial costurile."],
        ["c", "Pe rețelele sociale", "Nu. Acestea nu sunt surse oficiale despre costuri."],
      ]),
      q("com-3", "intrebari", "Un vânzător evită să-ți spună costul total. Ce înseamnă?", "c", [
        ["a", "Că produsul nu are costuri", "Nu. Orice produs are costuri; lipsa informației nu le elimină."],
        ["b", "Că e o ofertă limitată", "Nu. Presiunea timpului nu justifică lipsa transparenței."],
        ["c", "Este un semnal de atenție; cere informațiile în scris", "Corect. Transparența costurilor este esențială."],
      ]),
      q("com-4", "efect", "Cum poți modela un comision anual în simulatorul nostru?", "a", [
        ["a", "Scazi comisionul din randamentul nominal ipotetic", "Corect. Este o aproximare simplă a randamentului net de comision."],
        ["b", "Mărești inflația", "Nu. Inflația și comisioanele sunt lucruri diferite."],
        ["c", "Nu se poate", "Nu. Ajustarea randamentului este o aproximare utilă."],
      ]),
    ],
  },
  {
    slug: "taxe",
    title: "Taxele și randamentul net",
    summary: "De ce contează ce rămâne după impozite și unde verifici regulile actuale.",
    minutes: 4,
    sections: [
      {
        id: "brut-net",
        title: "Brut și net",
        body: [
          "Câștigurile din dobânzi, dividende sau vânzarea unor investiții pot fi impozitate. Randamentul brut este înainte de impozit; randamentul net este ce rămâne după.",
          "Pentru a compara corect două produse, compară randamentele nete, după costuri și impozite, nu cele brute.",
        ],
      },
      {
        id: "reguli",
        title: "Regulile se pot schimba",
        body: [
          "Cotele de impozitare și regulile de declarare diferă în funcție de tipul venitului și se pot schimba de la un an la altul. Această aplicație nu afișează cote fiscale, pentru a nu-ți oferi informații depășite.",
          "Verifică regulile actuale pe site-ul ANAF sau cu un specialist autorizat.",
        ],
      },
      {
        id: "ordine",
        title: "Ordinea corectă a calculelor",
        body: [
          "Un mod util de a gândi: randament anunțat → minus costuri → minus impozite → randament net nominal → comparat cu inflația → randament net real.",
          "Simulatorul nostru folosește un singur randament nominal. Dacă vrei să incluzi costuri sau taxe, introdu un randament ipotetic deja ajustat.",
        ],
      },
    ],
    takeaways: [
      "Compară randamente nete, nu brute.",
      "Regulile fiscale se schimbă — verifică-le la ANAF.",
      "Ordinea: costuri → impozite → inflație.",
    ],
    quiz: [
      q("tax-1", "brut-net", "Ce randament ar trebui să compari între două produse?", "b", [
        ["a", "Randamentul brut anunțat", "Nu. Randamentul brut nu ține cont de costuri și impozite."],
        ["b", "Randamentul net, după costuri și impozite", "Corect. Asta ajunge, de fapt, la tine."],
        ["c", "Cel mai mare procent din reclamă", "Nu. Reclamele pot prezenta cifre brute sau condiționate."],
      ]),
      q("tax-2", "reguli", "Unde verifici regulile fiscale actuale din România?", "a", [
        ["a", "Pe site-ul ANAF sau cu un specialist autorizat", "Corect. Sunt surse oficiale sau calificate."],
        ["b", "Într-un grup de discuții online", "Nu. Informațiile pot fi greșite sau depășite."],
        ["c", "Regulile sunt aceleași pentru totdeauna", "Nu. Regulile fiscale se pot schimba."],
      ]),
      q("tax-3", "ordine", "Care este ordinea corectă pentru a ajunge la randamentul net real?", "c", [
        ["a", "Inflație → impozite → costuri", "Nu. Inflația se compară la final, cu randamentul net nominal."],
        ["b", "Doar se scade inflația", "Nu. Costurile și impozitele contează și ele."],
        ["c", "Costuri → impozite → comparație cu inflația", "Corect. Mai întâi afli ce rămâne nominal, apoi compari cu inflația."],
      ]),
      q("tax-4", "reguli", "De ce această aplicație nu afișează cote de impozitare?", "b", [
        ["a", "Pentru că în România nu există impozite pe câștiguri", "Nu. Anumite câștiguri pot fi impozitate."],
        ["b", "Pentru că regulile se pot schimba, iar informațiile depășite te pot induce în eroare", "Corect. Recomandăm verificarea la sursa oficială."],
        ["c", "Pentru că taxele nu influențează randamentul", "Nu. Impozitele reduc randamentul net."],
      ]),
    ],
  },
  {
    slug: "fraude",
    title: "Cum recunoști o fraudă financiară",
    summary: "Semnalele de alarmă comune și ce faci concret dacă ceva pare suspect.",
    minutes: 7,
    sections: [
      {
        id: "semnale",
        title: "Semnale de alarmă",
        body: [
          "Promisiuni de câștig mare, rapid și „garantat”. Investițiile reale au riscuri, iar câștigurile nu pot fi garantate.",
          "Presiune de timp: „oferta expiră azi”, „contul tău va fi blocat în 30 de minute”. Graba te împiedică să verifici.",
          "Cereri neobișnuite: coduri primite prin SMS, date de card, instalarea unei aplicații de acces la distanță, plăți în criptomonede sau prin carduri cadou.",
          "Canale neobișnuite: mesaje de la numere necunoscute, linkuri scurtate, conturi noi pe rețele sociale, apeluri care par să vină de la bancă.",
        ],
      },
      {
        id: "verificare",
        title: "Cum verifici",
        body: [
          "Întrerupe conversația și contactează instituția pe un canal pe care îl găsești singur: numărul de pe spatele cardului, site-ul oficial scris de mână în browser, aplicația oficială.",
          "Pentru firme care oferă investiții, verifică dacă sunt autorizate și dacă apar în avertizările publicate de Autoritatea de Supraveghere Financiară (ASF).",
          "Când un „prieten” îți cere bani pe mesaj, sună-l pe numărul pe care îl știi deja.",
        ],
      },
      {
        id: "dupa",
        title: "Dacă ai fost păcălit",
        body: [
          "Contactează imediat banca pe canalele oficiale pentru a bloca cardul sau a încerca oprirea plății. Timpul contează.",
          "Schimbă parolele compromise și activează autentificarea în doi pași. Păstrează dovezile: capturi de ecran, mesaje, numere.",
          "Raportează incidentul la Poliție și tentativa de fraudă online către Directoratul Național de Securitate Cibernetică (DNSC). Nu te învinovăți — escrocheriile sunt construite profesionist.",
        ],
      },
    ],
    takeaways: [
      "Garantat + urgent + secret = semnal de alarmă.",
      "Verifică mereu pe un canal găsit de tine, nu pe cel primit.",
      "Nimeni legitim nu îți cere codurile din SMS sau parolele.",
    ],
    quiz: [
      q("fr-1", "semnale", "Care dintre următoarele este cel mai puternic semnal de fraudă?", "c", [
        ["a", "O bancă îți trimite extrasul lunar în aplicație", "Nu. Aceasta este o comunicare obișnuită pe un canal oficial."],
        ["b", "Un consultant îți explică riscurile unui produs", "Nu. Explicarea riscurilor este un semn bun."],
        ["c", "Un randament „garantat” de 30% pe lună", "Corect. Câștigurile mari garantate sunt un semnal clasic de fraudă."],
      ]),
      q("fr-2", "verificare", "Primești un apel de la „banca ta” despre o tranzacție suspectă. Ce faci?", "b", [
        ["a", "Le dai codul primit prin SMS ca să anuleze tranzacția", "Nu. Codul din SMS autorizează operațiuni; nu îl comunica nimănui."],
        ["b", "Închizi și suni la numărul de pe spatele cardului", "Corect. Verifici pe un canal pe care îl alegi tu."],
        ["c", "Instalezi aplicația pe care ți-o recomandă ca să te ajute", "Nu. Aplicațiile de acces la distanță pot oferi control asupra telefonului."],
      ]),
      q("fr-3", "verificare", "Cum verifici o firmă care îți oferă o investiție?", "a", [
        ["a", "Verifici autorizarea și avertizările publicate de ASF", "Corect. ASF supraveghează piața de capital și publică avertizări."],
        ["b", "Citești comentariile de pe pagina lor", "Nu. Comentariile pot fi false sau controlate de firmă."],
        ["c", "Te uiți dacă site-ul arată profesionist", "Nu. Un site arătos se face ușor și nu dovedește nimic."],
      ]),
      q("fr-4", "dupa", "Ai trimis bani unui escroc acum 10 minute. Care e primul pas?", "c", [
        ["a", "Aștepți să vezi dacă banii revin", "Nu. Timpul contează în încercarea de a opri o plată."],
        ["b", "Îi scrii escrocului să-ți returneze banii", "Nu. Escrocul nu are interes să te ajute și poate încerca să te păcălească din nou."],
        ["c", "Contactezi imediat banca pe canalele oficiale", "Corect. Apoi păstrezi dovezile și raportezi incidentul."],
      ]),
    ],
  },
  {
    slug: "etf",
    title: "Ce înseamnă să investești în ETF-uri",
    summary: "Ce este un ETF, ce costuri are, ce riscuri implică și ce verifici înainte să cumperi.",
    minutes: 7,
    tool: { href: "/simulator", label: "Vezi în simulator efectul costurilor și al timpului" },
    sections: [
      {
        id: "ce-este",
        title: "Ce este un ETF",
        body: [
          "Un ETF (exchange-traded fund) este un fond de investiții ale cărui unități se cumpără și se vând la bursă, la fel ca acțiunile. Fondul deține un coș de active — de exemplu acțiuni ale multor companii sau obligațiuni — iar cine cumpără o unitate deține indirect o parte din acel coș.",
          "Multe ETF-uri urmăresc un indice: încearcă să reproducă evoluția unui grup de active, nu să „bată” piața. De aceea sunt numite, adesea, fonduri pasive.",
          "În Uniunea Europeană, multe ETF-uri sunt organizate ca fonduri UCITS, care au reguli de diversificare și de informare a investitorilor. Asta nu înseamnă că nu pot pierde valoare.",
        ],
      },
      {
        id: "costuri",
        title: "Ce costuri ai",
        body: [
          "Fondul are costuri anuale (numite costuri curente sau TER), exprimate ca procent din suma investită și descrise în documentul cu informații esențiale (KID). Ele se scad din valoarea fondului în fiecare an.",
          "La acestea se adaugă costurile intermediarului (brokerului): comisioane de tranzacționare, eventual de administrare a contului, și costuri de schimb valutar dacă ETF-ul este cotat în altă monedă decât leul.",
          "Pe termen lung, diferențele mici de cost se adună. În simulator poți vedea efectul scăzând costul anual din randamentul ipotetic.",
        ],
      },
      {
        id: "riscuri",
        title: "Ce riscuri implică",
        body: [
          "Valoarea unui ETF urcă și coboară odată cu activele pe care le deține. Poți pierde o parte din bani, mai ales pe perioade scurte. Randamentele din trecut nu garantează randamentele viitoare.",
          "Dacă ETF-ul investește în active în altă monedă, câștigul sau pierderea în lei depinde și de cursul de schimb.",
          "Spre deosebire de depozitele bancare, investițiile în ETF-uri nu sunt garantate de Fondul de Garantare a Depozitelor Bancare. Diversificarea dintr-un ETF reduce riscul unei singure companii, dar nu și riscul general al pieței.",
        ],
      },
      {
        id: "verificare",
        title: "Ce verifici înainte",
        body: [
          "Verifică dacă intermediarul prin care cumperi este autorizat de Autoritatea de Supraveghere Financiară (ASF) sau de autoritatea unui alt stat UE și notificat pentru România. ASF publică registre și avertizări despre entități neautorizate.",
          "Citește documentul cu informații esențiale (KID): ce deține fondul, ce costuri are, ce nivel de risc indică.",
          "Gândește-te la orizontul de timp: banii de care ai nevoie curând sau fondul de urgență nu sunt, de regulă, potriviți pentru active volatile. Regulile fiscale le verifici pe site-ul ANAF.",
        ],
      },
    ],
    takeaways: [
      "Un ETF este un coș de active tranzacționat la bursă, nu o investiție garantată.",
      "Compară costurile totale: costurile curente ale fondului plus cele ale brokerului.",
      "Cumpără doar prin intermediari autorizați și citește KID-ul înainte.",
    ],
    quiz: [
      q("etf-1", "ce-este", "Ce primești când cumperi o unitate dintr-un ETF?", "b", [
        ["a", "O dobândă fixă, garantată", "Nu. Un ETF nu plătește o dobândă garantată; valoarea lui variază."],
        ["b", "O parte indirectă dintr-un coș de active", "Corect. Fondul deține activele, iar tu deții unități din fond."],
        ["c", "Un cont de economii la bancă", "Nu. Un ETF este un fond de investiții, nu un cont bancar."],
      ]),
      q("etf-2", "costuri", "Unde găsești costurile anuale ale unui ETF?", "a", [
        ["a", "În documentul cu informații esențiale (KID)", "Corect. Acolo sunt descrise costurile curente ale fondului."],
        ["b", "Doar în reclamele brokerului", "Nu. Reclamele pot omite costuri; sursa de referință este KID-ul."],
        ["c", "Un ETF nu are costuri", "Nu. Orice fond are costuri anuale, chiar dacă sunt mici."],
      ]),
      q("etf-3", "riscuri", "Sunt investițiile în ETF-uri garantate ca depozitele bancare?", "c", [
        ["a", "Da, de Fondul de Garantare a Depozitelor Bancare", "Nu. Acesta garantează depozite bancare, nu investiții în fonduri."],
        ["b", "Da, dacă fondul urmărește un indice", "Nu. Un indice poate scădea, iar fondul odată cu el."],
        ["c", "Nu, valoarea lor poate scădea", "Corect. Poți pierde bani, mai ales pe termen scurt."],
      ]),
      q("etf-4", "verificare", "Care este un prim pas bun înainte să cumperi un ETF?", "b", [
        ["a", "Să alegi ETF-ul cu cel mai mare randament de anul trecut", "Nu. Randamentele trecute nu garantează rezultate viitoare."],
        ["b", "Să verifici că brokerul este autorizat și să citești KID-ul", "Corect. Așa reduci riscul de fraudă și înțelegi ce cumperi."],
        ["c", "Să investești fondul de urgență", "Nu. Banii de urgență trebuie să fie disponibili și cu risc scăzut."],
      ]),
    ],
  },
];

export function getModule(slug: string): LearningModule | undefined {
  return MODULES.find((m) => m.slug === slug);
}
