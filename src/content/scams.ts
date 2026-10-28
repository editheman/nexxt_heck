import type { ScamScenario } from "./types";

/** All scenarios are fictional. Names, numbers and links are invented and intentionally non-functional. */
export const SCAMS: ScamScenario[] = [
  {
    id: "curier",
    title: "Coletul care „nu poate fi livrat”",
    channel: "SMS",
    sender: "+40 7xx xxx 381 (număr necunoscut)",
    message: [
      "Coletul dvs. nu a putut fi livrat din cauza unei taxe vamale neachitate de 4,99 lei.",
      "Achitați în 24h pentru a evita returnarea: livrare-colet-ro.example/plata",
    ],
    steps: [
      {
        id: "observa",
        prompt: "Ce ți se pare cel mai suspect în acest mesaj?",
        choices: [
          { id: "a", text: "Suma este foarte mică", correct: false, feedback: "Suma mică este, de fapt, o tactică: te face să nu verifici. Dar nu este semnalul principal." },
          { id: "b", text: "Linkul necunoscut și termenul de 24h", correct: true, feedback: "Exact. Un domeniu care imită o firmă de curierat, plus presiunea timpului, sunt semnale clasice de phishing." },
          { id: "c", text: "Nimic, firmele de curierat trimit des SMS-uri", correct: false, feedback: "Firmele trimit SMS-uri, dar nu cer plăți prin linkuri necunoscute. Pagina de plată poate fura datele cardului." },
        ],
      },
      {
        id: "actioneaza",
        prompt: "Ce faci?",
        choices: [
          { id: "a", text: "Plătesc, sunt doar 4,99 lei", correct: false, feedback: "Pe pagina falsă introduci datele cardului. Riscul nu este suma de 4,99 lei, ci accesul la card." },
          { id: "b", text: "Verific în aplicația sau pe site-ul oficial al curierului, scris de mine", correct: true, feedback: "Corect. Verifici pe un canal găsit de tine. Apoi poți șterge mesajul și îl poți raporta." },
          { id: "c", text: "Răspund la SMS ca să cer detalii", correct: false, feedback: "Un răspuns confirmă că numărul tău este activ și te poate expune la alte tentative." },
        ],
      },
    ],
    redFlags: ["Link către un domeniu necunoscut", "Termen-limită scurt", "Plată mică cerută prin SMS"],
    safeSteps: ["Nu accesa linkul", "Verifică expedierea în aplicația oficială a curierului", "Dacă ai introdus datele cardului, sună imediat banca"],
  },
  {
    id: "investitie",
    title: "Platforma cu „randament garantat”",
    channel: "Reclamă pe rețele sociale + WhatsApp",
    sender: "„Consultant financiar” Mihai, cont creat recent",
    message: [
      "Bună! Am văzut că v-ați înscris pentru informații. Platforma noastră folosește inteligență artificială și oferă un randament GARANTAT de 30% pe lună.",
      "Locurile sunt limitate. Puteți începe cu 1.000 lei, iar eu vă ajut să instalați aplicația ca să vă configurez contul.",
    ],
    steps: [
      {
        id: "observa",
        prompt: "Care este cel mai puternic semnal de alarmă?",
        choices: [
          { id: "a", text: "Folosește inteligență artificială", correct: false, feedback: "Termenii la modă sunt adesea folosiți ca momeală, dar semnalul principal este altul." },
          { id: "b", text: "Randamentul „garantat” de 30% pe lună", correct: true, feedback: "Exact. Nicio investiție legitimă nu poate garanta câștiguri, mai ales de această mărime." },
          { id: "c", text: "Suma minimă de 1.000 lei", correct: false, feedback: "O sumă de start mică este o tactică de atragere, dar nu este semnalul cel mai puternic." },
        ],
      },
      {
        id: "actioneaza",
        prompt: "„Consultantul” insistă să instalezi o aplicație ca să te „ajute”. Ce faci?",
        choices: [
          { id: "a", text: "Instalez, ca să văd cum funcționează", correct: false, feedback: "Aplicațiile de acces la distanță pot permite controlul telefonului și al aplicației bancare." },
          { id: "b", text: "Refuz și verific firma în avertizările publicate de ASF", correct: true, feedback: "Corect. ASF publică avertizări despre entități neautorizate. Nu instala nimic la cererea unei persoane necunoscute." },
          { id: "c", text: "Trimit doar 1.000 lei ca test", correct: false, feedback: "Platformele false arată adesea un „profit” inițial pentru a cere apoi sume mai mari." },
        ],
      },
    ],
    redFlags: ["Câștig garantat și foarte mare", "Presiune: „locuri limitate”", "Cerere de a instala o aplicație de acces la distanță", "Cont nou, fără identitate verificabilă"],
    safeSteps: ["Nu instala aplicații la cererea unor necunoscuți", "Verifică firma la ASF", "Raportează contul pe rețeaua socială și tentativa la DNSC"],
  },
  {
    id: "banca",
    title: "Apelul de la „departamentul de securitate”",
    channel: "Apel telefonic",
    sender: "Număr afișat care seamănă cu cel al unei bănci",
    message: [
      "„Bună ziua, vă sunăm de la departamentul de securitate al băncii. Am detectat o tranzacție suspectă de 3.450 lei.”",
      "„Pentru anulare, vă rugăm să ne comunicați codul pe care tocmai l-ați primit prin SMS. Avem nevoie de el în următoarele minute.”",
    ],
    steps: [
      {
        id: "observa",
        prompt: "Ce ar trebui să te alarmeze?",
        choices: [
          { id: "a", text: "Ți se cere codul primit prin SMS", correct: true, feedback: "Exact. Codul din SMS autorizează operațiuni. Banca nu îți cere niciodată să îl comunici." },
          { id: "b", text: "Numărul afișat arată ca al băncii", correct: false, feedback: "Numărul afișat poate fi falsificat (spoofing), deci nu este o dovadă. Semnalul principal este cererea codului." },
          { id: "c", text: "Apelul a venit în timpul programului de lucru", correct: false, feedback: "Ora apelului nu spune nimic despre legitimitatea lui." },
        ],
      },
      {
        id: "actioneaza",
        prompt: "Ce faci?",
        choices: [
          { id: "a", text: "Dau codul, ca să opresc tranzacția", correct: false, feedback: "Prin cod, chiar tu ai putea autoriza o plată sau adăugarea cardului pe alt telefon." },
          { id: "b", text: "Închid și sun la numărul de pe spatele cardului", correct: true, feedback: "Corect. Inițiezi tu apelul, pe un canal verificat. Dacă tranzacția era reală, banca te va ajuta." },
          { id: "c", text: "Le cer numele și rămân în apel", correct: false, feedback: "Un nume se inventează ușor. Rămânând în apel, ești expus în continuare presiunii." },
        ],
      },
    ],
    redFlags: ["Cererea codului din SMS", "Urgență și frică", "Încredere bazată doar pe numărul afișat"],
    safeSteps: ["Închide apelul", "Sună banca la numărul oficial", "Dacă ai comunicat codul, cere blocarea cardului imediat"],
  },
  {
    id: "prieten",
    title: "Prietenul care are nevoie urgentă de bani",
    channel: "WhatsApp",
    sender: "Număr nou: „Salut, sunt eu, Ioana, mi-am schimbat numărul”",
    message: [
      "Salut! Mi s-a stricat telefonul și acum folosesc numărul ăsta. Am o mică problemă…",
      "Trebuie să plătesc azi o factură de 1.800 lei și aplicația mea nu merge. Poți să-mi trimiți tu și îți dau înapoi mâine? Te rog nu suna, sunt într-o ședință.",
    ],
    steps: [
      {
        id: "observa",
        prompt: "Ce este suspect?",
        choices: [
          { id: "a", text: "Folosește un ton prietenos", correct: false, feedback: "Escrocii imită tonul persoanelor apropiate. Tonul nu este o dovadă." },
          { id: "b", text: "Număr nou + urgență + „nu suna”", correct: true, feedback: "Exact. Combinația te împiedică să verifici identitatea persoanei." },
          { id: "c", text: "Suma este rotundă", correct: false, feedback: "Suma în sine nu este semnalul principal." },
        ],
      },
      {
        id: "actioneaza",
        prompt: "Ce faci?",
        choices: [
          { id: "a", text: "O sun pe Ioana la numărul vechi, pe care îl știu", correct: true, feedback: "Corect. Verifici identitatea pe un canal cunoscut. Poți pune și o întrebare la care doar ea ar ști răspunsul." },
          { id: "b", text: "Trimit banii, e prietena mea", correct: false, feedback: "Nu ai verificat că persoana chiar este Ioana. Plățile instant sunt greu de recuperat." },
          { id: "c", text: "Îi cer o poză ca dovadă", correct: false, feedback: "Pozele pot fi luate de pe profilurile publice. Un apel pe numărul cunoscut este mai sigur." },
        ],
      },
    ],
    redFlags: ["Număr nou necunoscut", "Urgență", "Descurajarea unui apel", "Cerere de plată către un cont necunoscut"],
    safeSteps: ["Sună persoana pe numărul cunoscut", "Nu trimite bani înainte de verificare", "Avertizează-ți prietenul dacă identitatea i-a fost folosită"],
  },
];
