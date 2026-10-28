import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/journey/NextStep";
import { Alert } from "@/components/ui/Alert";
import { CONSENT_TEXT, CONSENT_TEXT_VERSION } from "@/content/consent";

export const metadata: Metadata = { title: "Notă de confidențialitate" };

const SECTIONS: Array<{ id: string; title: string; body: React.ReactNode }> = [
  {
    id: "ce-date",
    title: "Ce date folosim",
    body: (
      <>
        <p>
          <strong>Fără abonare:</strong> profilul financiar aproximativ, ipotezele și progresul tău rămân doar în acest
          browser (localStorage). Pentru propunerea de abonare reținem doar <em>care</em> articole ai deschis (lista
          modulelor, fără ore, fără adrese de pagină și fără alte date de navigare) și dacă ai închis sau refuzat
          propunerea.
        </p>
        <p>
          <strong>Doar dacă te abonezi:</strong> adresa de e-mail și, separat de ea, o înregistrare a acordului tău (data
          și ora, versiunea textului de acord și locul din aplicație unde l-ai dat). Nu cerem nume, venit, economii,
          datorii sau alte informații financiare pentru abonare.
        </p>
      </>
    ),
  },
  {
    id: "scop",
    title: "Scopul e-mailurilor",
    body: (
      <p>
        Un digest săptămânal cu noutăți economice din România și explicații despre cum pot influența viața de zi cu zi,
        plus materiale educaționale din această platformă. Nu trimitem oferte de produse financiare și nu vindem sau
        închiriem adresele.
      </p>
    ),
  },
  {
    id: "temei",
    title: "Temeiul și acordul",
    body: (
      <>
        <p>
          Trimiterea digestului se bazează pe consimțământul tău (art. 6 alin. (1) lit. a din Regulamentul (UE)
          2016/679 – GDPR). Simpla introducere a adresei de e-mail nu înseamnă acord: căsuța de acord este separată și
          nebifată implicit.
        </p>
        <p className="rounded-[var(--radius-control)] bg-surface-muted p-4 text-sm">
          Textul acordului (versiunea {CONSENT_TEXT_VERSION}): „{CONSENT_TEXT}”
        </p>
      </>
    ),
  },
  {
    id: "retragere",
    title: "Cum îți retragi acordul",
    body: (
      <p>
        Oricând, fără să explici de ce: din linkul de dezabonare din fiecare e-mail, din pagina{" "}
        <Link href="/dezabonare" className="font-semibold text-primary underline underline-offset-2">
          Dezabonare
        </Link>{" "}
        sau din pagina{" "}
        <Link href="/progres" className="font-semibold text-primary underline underline-offset-2">
          Progres
        </Link>
        . Retragerea nu afectează legalitatea trimiterilor făcute înainte de ea.
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
        Aplicația nu are încă un server sau un serviciu de e-mail conectat. Nu se trimit e-mailuri și nicio dată nu
        părăsește browserul tău. Înainte de lansare, această notă trebuie completată cu identitatea și datele de contact
        ale operatorului, furnizorii de servicii (de exemplu, serviciul de e-mail) și perioadele de păstrare.
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
