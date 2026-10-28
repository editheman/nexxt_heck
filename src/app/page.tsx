import { BookOpen, Briefcase, ShieldAlert, Target, Users } from "lucide-react";
import { IndustryFunnel } from "@/components/home/IndustryFunnel";
import { MacroTicker } from "@/components/home/MacroTicker";
import { UseDemoProfileButton } from "@/components/profile/UseDemoProfileButton";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FACTS } from "@/content/facts";

const STEPS = [
  { icon: Briefcase, title: "Domeniul tău", text: "Un click și vezi o cifră reală despre sectorul în care lucrezi." },
  { icon: Target, title: "Reality Check", text: "Cât a mâncat inflația oficială (INS, BNR) din economiile tale — în lei, în salarii și în shaorme." },
  { icon: ShieldAlert, title: "Scenarii de fraudă", text: "Exersează pe mesaje fictive, inspirate din tentative reale: phishing, broker fals, crypto." },
  { icon: BookOpen, title: "Învață și verifică", text: "Module scurte, quiz-uri cu explicații pe fiecare răspuns." },
  { icon: Users, title: "Compară cu prietenii", text: "Opțional, sub un alias: doar progresul educațional, niciodată sume." },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge kind="fictional">Demo educațional</Badge>
        </div>
        <h1 className="text-4xl font-semibold text-primary sm:text-5xl">Protejează ce ai construit</h1>
        <p className="max-w-[60ch] text-lg text-ink-muted">
          Învață să-ți protejezi banii, să recunoști fraudele și să înțelegi riscurile înainte să iei o decizie
          financiară.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="#domeniu">Începe — durează 10 secunde</ButtonLink>
          <UseDemoProfileButton />
        </div>
        <p className="text-sm text-ink-muted">
          Fără cont, fără CNP. Ce alegi rămâne doar în browserul tău și poate fi șters oricând din pagina Progres.
        </p>
      </section>

      <MacroTicker facts={FACTS.macroFacts} generatedAt={FACTS.generatedAt} />

      <IndustryFunnel />

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
