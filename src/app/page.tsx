import { BookOpen, ChartLine, ShieldAlert, Target, UserRound } from "lucide-react";
import { UseDemoProfileButton } from "@/components/profile/UseDemoProfileButton";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const STEPS = [
  { icon: UserRound, title: "Profil financiar minim", text: "Câteva cifre aproximative despre economiile tale. Fără CNP, IBAN sau date de card." },
  { icon: Target, title: "Reality Check", text: "Vezi diferența dintre suma din cont și ce vei putea cumpăra cu ea, sub ipoteze clare." },
  { icon: ChartLine, title: "Simulator", text: "Schimbă ipotezele și compară valoarea nominală cu puterea de cumpărare." },
  { icon: ShieldAlert, title: "Scenarii de fraudă", text: "Exersează pe mesaje fictive, inspirate din tentative reale." },
  { icon: BookOpen, title: "Învață și verifică", text: "Module scurte, quiz-uri cu explicații și progres salvat." },
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge kind="fictional">Demo educațional</Badge>
          </div>
          <h1 className="text-4xl font-semibold text-primary sm:text-5xl">Protejează ce ai construit</h1>
          <p className="max-w-[60ch] text-lg text-ink-muted">
            Învață să-ți protejezi banii, să recunoști fraudele și să înțelegi riscurile înainte să iei o decizie
            financiară.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/profil">Începe demo-ul</ButtonLink>
            <UseDemoProfileButton />
          </div>
          <p className="text-sm text-ink-muted">
            Durează aproximativ 15 minute. Datele rămân doar în browserul tău și pot fi șterse oricând din pagina
            Progres.
          </p>
        </div>

        <Card className="space-y-4">
          <p className="font-heading text-lg font-semibold">Un exemplu ilustrativ</p>
          <p className="text-ink-muted">
            10.000 lei ținuți 10 ani fără dobândă rămân <strong className="text-ink">10.000 lei</strong> în cont.
          </p>
          <p className="text-ink-muted">
            Dacă presupunem o inflație de 5% pe an, ar avea puterea de cumpărare a aproximativ{" "}
            <strong className="text-accent">6.139 lei de azi</strong>.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge kind="assumption">Ipoteză: inflație 5%/an</Badge>
            <Badge kind="estimate" />
          </div>
          <p className="text-sm text-ink-muted">
            Nu este o prognoză. În aplicație poți schimba orice ipoteză și vezi exact cum se calculează.
          </p>
        </Card>
      </section>

      <section aria-labelledby="pasi" className="space-y-6">
        <h2 id="pasi" className="text-2xl font-semibold">
          Ce vei face
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Card className="h-full space-y-3 p-5">
                <div className="flex items-center gap-3">
                  <span className="tabular flex size-8 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                    {i + 1}
                  </span>
                  <s.icon aria-hidden className="size-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold">{s.title}</h3>
                <p className="text-sm text-ink-muted">{s.text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="principii" className="grid gap-4 md:grid-cols-3">
        <h2 id="principii" className="sr-only">
          Principii
        </h2>
        <Card className="space-y-2">
          <h3 className="text-lg font-semibold">Transparent</h3>
          <p className="text-ink-muted">Fiecare cifră arată dacă vine de la tine, dintr-o ipoteză sau dintr-un calcul.</p>
        </Card>
        <Card className="space-y-2">
          <h3 className="text-lg font-semibold">Fără recomandări</h3>
          <p className="text-ink-muted">Nu îți spunem ce să cumperi sau să vinzi. Îți explicăm mecanismele ca să decizi informat.</p>
        </Card>
        <Card className="space-y-2">
          <h3 className="text-lg font-semibold">Fără date sensibile</h3>
          <p className="text-ink-muted">Nu cerem CNP, IBAN, date de card sau parole. Nu avem conturi și nici servere care să-ți stocheze datele.</p>
        </Card>
      </section>
    </div>
  );
}
