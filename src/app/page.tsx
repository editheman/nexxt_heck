import { ArrowRight, CircleCheck, Clock, Landmark, Lock, ShieldCheck, TrendingDown } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

const PILLARS = [
  { n: "01", icon: Landmark, title: "Fond de urgență", text: "3–6 luni de cheltuieli esențiale", href: "/invata/lichiditate" },
  { n: "02", icon: ShieldCheck, title: "Protecție anti-fraudă", text: "SMS-uri, apeluri și oferte false", href: "/fraude" },
  { n: "03", icon: TrendingDown, title: "Inflație & putere de cumpărare", text: "Cât valorează azi economiile tale", href: "/reality-check" },
] as const;

const TRUST = [
  { icon: CircleCheck, text: "Gratuit" },
  { icon: Lock, text: "Fără produse financiare promovate" },
  { icon: Clock, text: "Aproximativ 15 minute" },
] as const;

export default function Home() {
  return (
    // One screen on laptop/desktop; on very short or narrow screens it may scroll rather than clip content.
    <section className="hero-wash flex min-h-[calc(100dvh-4rem-1px)] flex-col" data-testid="home">
      <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-4 py-5 short:py-3 sm:px-6 lg:px-8">
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center short:py-4">
          <h1 className="max-w-[20ch] text-[2.4rem] leading-[1.08] text-ink sm:text-6xl sm:short:text-5xl">
            Învață azi. <span className="text-gradient">Decide informat.</span>
          </h1>
          <p className="mt-5 max-w-[56ch] text-lg text-ink-muted short:mt-3">
            Învață să-ți protejezi banii, să recunoști fraudele și să înțelegi riscurile înainte să iei o decizie
            financiară importantă.
          </p>
          <div className="mt-8 short:mt-5 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href="/profil" className="min-h-12 px-7 text-base">
              Începe demo-ul <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </div>
          <ul className="mt-6 short:mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-muted">
            {TRUST.map((t, i) => (
              <li key={t.text} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden className="mr-3.5 hidden size-1 rounded-full bg-border-strong sm:inline-block" />}
                <t.icon aria-hidden className="size-4 text-accent" />
                {t.text}
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Teme principale" className="mx-auto w-full max-w-[1040px]">
          <ul className="grid gap-3 rounded-[var(--radius-card)] border border-border bg-surface/90 p-3 shadow-[var(--shadow-card)] md:grid-cols-3">
            {PILLARS.map((p) => (
              <li key={p.n}>
                <Link
                  href={p.href}
                  className="group flex h-full min-h-16 items-center gap-4 rounded-[var(--radius-control)] border border-border bg-bg/60 px-4 py-3 transition-colors hover:border-primary hover:bg-primary-soft"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-border bg-surface text-primary">
                    <p.icon aria-hidden className="size-5" />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="flex flex-wrap items-baseline gap-x-2 text-sm">
                      <span className="font-mono text-xs text-ink-muted">PILON {p.n}</span>
                      <span className="font-semibold text-primary">{p.title}</span>
                    </span>
                    <span className="block text-sm text-ink-muted">{p.text}</span>
                  </span>
                  <ArrowRight aria-hidden className="ml-auto size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
