import type { Metadata } from "next";
import { PageHeader } from "@/components/journey/NextStep";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = { title: "Notă de confidențialitate" };

const SECTIONS: Array<{ id: string; title: string; body: React.ReactNode }> = [
  {
    id: "ce-date",
    title: "Ce date folosim",
    body: (
      <>
        <p>
          <strong>Profilul și progresul:</strong> profilul financiar aproximativ, răspunsurile despre risc, ipotezele,
          recomandările salvate, metodele alese și progresul tău rămân doar în acest browser (localStorage).
        </p>
        <p>
          <strong>Contul demo:</strong> numele de utilizator și o amprentă criptografică a parolei (hash PBKDF2 cu
          „sare” aleatoare) — parola în sine nu se salvează. Profilul și progresul fiecărui cont sunt păstrate separat,
          tot doar în acest browser. Nu putem recupera o parolă uitată.
        </p>
        <p>Nu cerem adresă de e-mail, CNP, IBAN sau date de card și nu trimitem e-mailuri.</p>
      </>
    ),
  },
  {
    id: "recomandari",
    title: "Recomandările generate cu AI",
    body: (
      <p>
        Dacă serverul are configurat un model AI, pentru recomandări trimitem doar date anonimizate și grupate pe
        intervale (de exemplu, orizontul, obiectivul și un interval al economiilor) — niciodată numele de utilizator.
      </p>
    ),
  },
  {
    id: "drepturi",
    title: "Drepturile tale",
    body: (
      <p>
        Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție, precum și dreptul de a
        depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (
        <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2">
          ANSPDCP
        </a>
        ). În versiunea demo, poți șterge oricând toate datele din pagina Progres → „Resetează demo-ul”.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <article className="mx-auto max-w-[720px] space-y-10">
      <PageHeader step="Confidențialitate" title="Notă de confidențialitate" lead="Ce date folosim, de ce, și cum le controlezi." />
      <Alert tone="assumption" title="Versiune demo">
        Aplicația nu are încă o bază de date pe server: profilul, contul și progresul rămân în browserul tău. Înainte de
        lansare, această notă trebuie completată cu identitatea și datele de contact ale operatorului, furnizorii de
        servicii și perioadele de păstrare.
      </Alert>
      {SECTIONS.map((s) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-t`} className="scroll-mt-24 space-y-3 leading-relaxed">
          <h2 id={`${s.id}-t`} className="text-2xl text-ink">
            {s.title}
          </h2>
          {s.body}
        </section>
      ))}
    </article>
  );
}
