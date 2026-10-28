import { ArrowRight, Calculator, ChevronDown, Clock, Compass, Filter, Landmark, Lightbulb, ShieldAlert, ShieldCheck, ShoppingBasket, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { ContinueStrip } from "@/components/home/ContinueStrip";
import { PerspectiveCalculator } from "@/components/home/PerspectiveCalculator";
import { UseDemoProfileButton } from "@/components/profile/UseDemoProfileButton";
import { Badge, Tag, type TagTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getModule } from "@/content/modules";

const TOPICS: Array<{ label: string; href: string }> = [
  { label: "Inflație", href: "/invata/inflatia" },
  { label: "Randament real", href: "/invata/randament-real" },
  { label: "Lichiditate", href: "/invata/lichiditate" },
  { label: "Diversificare", href: "/invata/diversificare" },
  { label: "Comisioane", href: "/invata/comisioane" },
  { label: "Taxe", href: "/invata/taxe" },
  { label: "Anti-fraudă", href: "/fraude" },
];

const SIDE_ARTICLES: Array<{ slug: string; tag: string; tone: TagTone }> = [
  { slug: "randament-real", tag: "Randamente", tone: "rose" },
  { slug: "fraude", tag: "Securitate", tone: "mint" },
  { slug: "comisioane", tag: "Costuri", tone: "indigo" },
];

const PATHS = [
  { icon: ShoppingBasket, title: "De ce cumpără banii tăi mai puțin?", text: "Cum funcționează inflația, de ce se compune în timp și cum o compari cu economiile tale.", href: "/invata/inflatia", bar: "primary", tile: "bg-primary-soft text-primary", link: "text-primary" },
  { icon: Landmark, title: "Ce se întâmplă cu banii mei?", text: "Valoarea nominală față de puterea de cumpărare, pe cifrele tale, cu ipoteze pe care le alegi.", href: "/reality-check", bar: "accent", tile: "bg-accent-soft text-accent", link: "text-accent" },
  { icon: ShieldAlert, title: "Pot avea încredere în ofertă?", text: "Scenarii fictive cu SMS-uri, apeluri „de la bancă” și platforme cu randament „garantat”.", href: "/fraude", bar: "danger", tile: "bg-danger-soft text-danger", link: "text-danger" },
  { icon: SlidersHorizontal, title: "Cum iau decizii mai bune?", text: "Fondul de urgență, lichiditatea, diversificarea și costurile care se adună an de an.", href: "/invata/lichiditate", bar: "primary", tile: "bg-primary-soft text-primary", link: "text-primary" },
] as const;

export default function Home() {
  const featured = getModule("inflatia")!;

  return (
    <>
      {/* Hero */}
      <section className="hero-wash border-b border-border/60">
        <div className="mx-auto max-w-[1120px] px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24 lg:px-8">
          <p className="eyebrow mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-ink shadow-[var(--shadow-card)]">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            Educație financiară · Demo gratuit
          </p>
          <h1 className="mx-auto mt-6 max-w-[18ch] text-[2.5rem] leading-[1.08] text-ink sm:text-6xl">
            Prețurile se schimbă.
            <span className="text-gradient block pb-1">Știi ce înseamnă pentru banii tăi?</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[58ch] text-lg text-ink-muted">
            Învață să-ți protejezi banii, să recunoști fraudele și să înțelegi riscurile înainte să iei o decizie
            financiară — fără jargon și fără promisiuni deșarte.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/profil">
              Începe demo-ul <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <UseDemoProfileButton />
          </div>
          <p className="mx-auto mt-6 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full bg-surface/70 px-3 py-1.5 font-mono text-xs text-ink-muted">
            <ShieldCheck aria-hidden className="size-3.5 text-accent" />
            Fără cont · Fără date bancare sau CNP · Datele rămân în browserul tău
          </p>

          <nav aria-label="Teme" className="mt-14 text-left">
            <Eyebrow tone="muted" icon={<Filter aria-hidden className="size-3.5" />}>
              Explorează temele
            </Eyebrow>
            <ul className="mt-3 flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="inline-flex min-h-9 items-center rounded-full border border-border bg-surface px-3.5 font-mono text-xs text-ink transition-colors hover:border-primary hover:text-primary"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* Decodificator */}
      <section aria-labelledby="decodificator" className="bg-surface">
        <div className="mx-auto max-w-[1120px] space-y-10 px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Eyebrow dot>Decodificator financiar</Eyebrow>
              <h2 id="decodificator" className="text-3xl text-ink sm:text-[2.5rem]">Ce contează pentru banii tăi</h2>
              <p className="text-ink-muted">Conceptele esențiale, explicate pe înțelesul tău și fără ocolișuri.</p>
            </div>
            <p className="flex items-center gap-2 font-mono text-xs text-ink-muted">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" /> Conținut educațional · exemple ilustrative
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
            <Card className="relative space-y-5 overflow-hidden p-7 sm:p-8">
              <span aria-hidden className="absolute -top-16 -right-16 size-48 rounded-full bg-primary-soft/70" />
              <div className="relative flex flex-wrap items-center gap-3 font-mono text-xs text-ink-muted">
                <Tag tone="indigo">Inflație</Tag>
                <span className="flex items-center gap-1">
                  <Clock aria-hidden className="size-3.5" /> Lectură: {featured.minutes} min
                </span>
              </div>
              <h3 className="relative text-2xl leading-snug text-ink sm:text-[1.75rem]">
                {featured.title}: de ce 10.000 lei de azi nu vor cumpăra la fel peste 10 ani
              </h3>
              <p className="relative text-ink-muted">{featured.summary} Banii din cont nu dispar, dar fiecare leu cumpără mai puțin când prețurile cresc.</p>
              <div className="relative flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-control)] bg-primary-soft p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-[var(--radius-control)] bg-surface text-primary">
                    <ArrowRight aria-hidden className="size-5" />
                  </span>
                  <div>
                    <p className="font-mono text-xs text-ink-muted">10.000 lei, 10 ani, fără dobândă</p>
                    <p className="tabular text-xl font-bold text-ink">
                      ≈ 6.139 lei <span className="text-sm font-normal text-ink-muted">în lei de azi</span>
                    </p>
                  </div>
                </div>
                <Badge kind="assumption">Ipoteză: inflație 5%/an</Badge>
              </div>
              <details className="group relative rounded-[var(--radius-control)] px-1">
                <summary className="flex min-h-11 list-none items-center justify-between gap-2 font-semibold text-primary [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    <Lightbulb aria-hidden className="size-4" /> De ce contează pentru mine?
                  </span>
                  <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-2 text-sm text-ink">
                  Dacă ții economiile într-un cont fără dobândă, suma rămâne aceeași, dar ce poți cumpăra cu ea scade în
                  ritmul inflației. Compară mereu randamentul cu inflația și verifică rata oficială la INS.{" "}
                  <Link href={`/invata/${featured.slug}`} className="font-semibold text-primary underline underline-offset-2">
                    Citește modulul
                  </Link>
                </p>
              </details>
            </Card>

            <ul className="space-y-5">
              {SIDE_ARTICLES.map((a) => {
                const m = getModule(a.slug)!;
                return (
                  <li key={a.slug}>
                    <Card className="space-y-2.5 p-6">
                      <div className="flex items-center justify-between gap-2">
                        <Tag tone={a.tone}>{a.tag}</Tag>
                        <span className="font-mono text-xs text-ink-muted">{m.minutes} min</span>
                      </div>
                      <h3 className="text-lg leading-snug text-ink">{m.title}</h3>
                      <p className="text-sm text-ink-muted">{m.summary}</p>
                      <Link href={`/invata/${m.slug}`} className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                        Citește modulul <ArrowRight aria-hidden className="size-4" />
                      </Link>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section aria-labelledby="perspectiva" className="hero-wash">
        <div className="mx-auto max-w-[1000px] space-y-10 px-4 py-20 sm:px-6 lg:px-8">
          <div className="space-y-3 text-center">
            <Eyebrow tone="accent" center icon={<Calculator aria-hidden className="size-3.5" />}>
              Claritate matematică
            </Eyebrow>
            <h2 id="perspectiva" className="mx-auto max-w-[20ch] text-3xl text-ink sm:text-[2.5rem]">
              Hai să punem economiile în perspectivă
            </h2>
            <p className="mx-auto max-w-[60ch] text-ink-muted">
              Un exercițiu simplu: bani ținuți fără dobândă vs. ce ai putea cumpăra cu ei peste câțiva ani.
            </p>
          </div>
          <PerspectiveCalculator />
          <p className="text-center">
            <ButtonLink href="/simulator" variant="secondary">
              Deschide simulatorul complet <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </p>
        </div>
      </section>

      {/* Paths */}
      <section aria-labelledby="parcursuri" className="bg-bg">
        <div className="mx-auto max-w-[1120px] space-y-10 px-4 py-20 sm:px-6 lg:px-8">
          <div className="space-y-3 text-center">
            <Eyebrow center icon={<Compass aria-hidden className="size-3.5" />}>
              Parcursuri tematice
            </Eyebrow>
            <h2 id="parcursuri" className="text-3xl text-ink sm:text-[2.5rem]">Ce ai vrea să înțelegi mai bine?</h2>
            <p className="text-ink-muted">Alege direcția care te interesează. Module scurte, practice, pentru oameni ocupați.</p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PATHS.map((p) => (
              <li key={p.title}>
                <Link href={p.href} className="group block h-full rounded-[var(--radius-card)]">
                  <Card bar={p.bar} className="flex h-full flex-col gap-4 pt-7 transition-shadow group-hover:shadow-[var(--shadow-raised)]">
                    <span className={`flex size-11 items-center justify-center rounded-[var(--radius-control)] ${p.tile}`}>
                      <p.icon aria-hidden className="size-5" />
                    </span>
                    <h3 className="text-lg leading-snug text-ink">{p.title}</h3>
                    <p className="flex-1 text-sm text-ink-muted">{p.text}</p>
                    <span className={`flex items-center gap-1.5 text-sm font-semibold ${p.link}`}>
                      Explorează (fără cont) <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="Progresul tău" className="border-y border-border/70 bg-surface">
        <ContinueStrip />
      </section>
    </>
  );
}
