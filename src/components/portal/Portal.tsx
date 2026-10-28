"use client";

import { ArrowRight, BookOpen, ChartLine, CheckCircle2, Pencil, ShieldAlert, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { formatLei } from "@/lib/format";
import { MODULES } from "@/content/modules";
import { SCAMS } from "@/content/scams";
import { GOAL_PATHS } from "@/content/goalPaths";
import { GOAL_LABELS } from "@/content/labels";
import { computeProgress, isPassed } from "@/lib/progress";
import { modulesForGoal } from "@/lib/goals";
import type { DemoState } from "@/lib/storage";
import { currentGeneration, history, methodsOf, type Plans } from "@/lib/plans";
import { useAuth } from "@/lib/useAuth";
import { useDemoState } from "@/lib/useDemoState";

const catalog = { moduleSlugs: MODULES.map((m) => m.slug), scamIds: SCAMS.map((s) => s.id) };
const AGE: Record<string, string> = { "20-25": "20–25 ani", "26-30": "26–30 ani", "31-35": "31–35 ani" };

/** Where an unfinished profiling should continue. */
function resumeHref(s: DemoState) {
  if (!s.profile) return "/profil";
  if (!s.progress.visited.reality) return "/reality-check";
  return "/simulator";
}

export function Portal() {
  const { state, hydrated } = useDemoState();
  const { account } = useAuth();
  if (!hydrated) return <PageSkeleton />;

  if (!account) {
    return (
      <Card className="mx-auto max-w-[640px] space-y-4 text-center" data-testid="portal-login">
        <h1 className="text-2xl text-ink">Portalul tău e disponibil după autentificare</h1>
        <p className="text-ink-muted">Intră în cont sau creează unul nou — durează câteva minute.</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/intra">Intră în cont</ButtonLink>
          <ButtonLink href="/profil" variant="secondary">
            Creează cont
          </ButtonLink>
        </div>
      </Card>
    );
  }

  const p = state.profile;
  if (!p) {
    return (
      <Card className="mx-auto max-w-[640px] space-y-4 text-center">
        <h1 className="text-2xl text-ink">Mai ai de completat profilul</h1>
        <p className="text-ink-muted">Completează profilul în câțiva pași, apoi aici găsești tot ce ai nevoie.</p>
        <ButtonLink href="/profil">Completează profilul</ButtonLink>
      </Card>
    );
  }

  const progress = computeProgress(state, catalog);
  const recommended = modulesForGoal(p.goal);
  const scamsDone = SCAMS.filter((s) => state.progress.scams[s.id]).length;
  const done = state.onboarding.completedAt !== null;

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Eyebrow dot>Portalul tău</Eyebrow>
          <h1 className="text-3xl text-ink sm:text-[2.6rem]">Bună{p.alias ? `, ${p.alias}` : ""}!</h1>
          <p className="text-lg text-ink-muted">Alege de unde vrei să continui. Nimic nu e obligatoriu și nu contează ordinea.</p>
        </div>
        <Link href="/progres" className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3 shadow-[var(--shadow-card)] hover:border-primary">
          <span className="tabular text-2xl font-bold text-primary" data-testid="portal-progress">{progress.percent}%</span>
          <span className="text-sm text-ink-muted">progres total<br />Vezi detalii →</span>
        </Link>
      </header>

      {!done && (
        <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-primary/30 bg-primary-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink">
            <strong>Profilarea nu e terminată.</strong> Mai ai câțiva pași până la recomandările complete.
          </p>
          <ButtonLink href={resumeHref(state)}>Continuă profilarea</ButtonLink>
        </div>
      )}

      <MethodsCard plans={state.plans} />

      <Link
        href="/recomandari"
        data-testid="portal-recommendations"
        className="group flex flex-col gap-3 rounded-[var(--radius-card)] border border-primary/30 bg-primary-soft p-5 transition-colors hover:border-primary sm:flex-row sm:items-center sm:justify-between"
      >
        <span className="space-y-1">
          <Eyebrow dot>Recomandări</Eyebrow>
          <span className="block text-lg font-semibold text-ink">Ce te ajută să-ți păstrezi puterea de cumpărare</span>
          <span className="block text-sm text-ink-muted">Categoriile de produse potrivite profilului tău, în ordine, cu motivul fiecăreia.</span>
        </span>
        <ArrowRight aria-hidden className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
      </Link>

      <section aria-labelledby="recomandate" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <Eyebrow>Pentru obiectivul tău</Eyebrow>
            <h2 id="recomandate" className="text-2xl text-ink" data-testid="portal-goal">{GOAL_LABELS[p.goal]}</h2>
            <p className="max-w-[68ch] text-ink-muted">{GOAL_PATHS[p.goal].intro}</p>
          </div>
          <Link href="/profil" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <Pencil aria-hidden className="size-4" /> Schimbă obiectivul
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="portal-recommended">
          {recommended.map((m) => {
            const read = state.progress.modulesRead[m.slug];
            const q = state.progress.quizzes[m.slug];
            return (
              <li key={m.slug}>
                <Link href={`/invata/${m.slug}`} className="group block h-full rounded-[var(--radius-card)]">
                  <Card className="flex h-full flex-col gap-2 p-5 transition-shadow group-hover:shadow-[var(--shadow-raised)]">
                    <span className="font-mono text-xs text-ink-muted">{m.minutes} min</span>
                    <h3 className="text-lg leading-snug text-ink">{m.title}</h3>
                    <p className="flex-1 text-sm text-ink-muted">{m.summary}</p>
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {q && isPassed(q.best, q.total) ? (
                        <span className="flex items-center gap-1 text-success"><CheckCircle2 aria-hidden className="size-4" /> Quiz trecut</span>
                      ) : read ? (
                        <span className="text-accent">Citit · fă quiz-ul</span>
                      ) : (
                        <span className="text-primary">Începe modulul →</span>
                      )}
                    </span>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="continua" className="space-y-4">
        <h2 id="continua" className="text-2xl text-ink">Continuă să înveți</h2>
        <ul className="grid gap-4 md:grid-cols-2">
          <li>
            <PortalCard href="/invata" icon={BookOpen} bar="primary" title="Învață" testId="portal-learn"
              text={`${MODULES.length} module scurte, ordonate după obiectivul tău, fiecare cu un quiz.`}
              meta={`${progress.modulesRead}/${MODULES.length} citite · ${progress.quizzesPassed} quiz-uri trecute`} />
          </li>
          <li>
            <PortalCard href="/fraude" icon={ShieldAlert} bar="danger" title="Recunoaște fraudele" testId="portal-scams"
              text="Scenarii fictive cu SMS-uri, apeluri „de la bancă” și oferte „garantate”."
              meta={`${scamsDone}/${SCAMS.length} scenarii parcurse`} />
          </li>
        </ul>
      </section>

      <section aria-labelledby="instrumente" className="space-y-4">
        <h2 id="instrumente" className="text-2xl text-ink">Instrumentele tale</h2>
        <ul className="grid gap-4 md:grid-cols-2">
          <li>
            <PortalCard href="/reality-check" icon={Target} bar="accent" title="Reality Check" testId="portal-reality"
              text="Cât ar fi pierdut economiile tale din cauza inflației, pe date oficiale INS și BNR." />
          </li>
          <li>
            <PortalCard href="/simulator" icon={ChartLine} bar="accent" title="Simulator" testId="portal-simulator"
              text="Compară valoarea nominală cu puterea de cumpărare, sub ipotezele tale." />
          </li>
        </ul>
      </section>

      <section aria-labelledby="profil" className="space-y-4">
        <h2 id="profil" className="text-2xl text-ink">Profilul tău</h2>
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
            <div><dt className="text-ink-muted">Nume / pseudonim</dt><dd className="font-semibold text-ink">{p.alias || "—"}</dd></div>
            <div><dt className="text-ink-muted">Interval de vârstă</dt><dd className="font-semibold text-ink">{p.ageRange ? AGE[p.ageRange] : "Nespecificat"}</dd></div>
            <div><dt className="flex items-center gap-2 text-ink-muted">Economii <Badge kind={p.isDemo ? "fictional" : "user"} /></dt><dd className="tabular font-semibold text-ink">{formatLei(p.savings)}</dd></div>
          </dl>
          <ButtonLink href="/profil" variant="secondary">
            <Pencil aria-hidden className="size-4" /> Modifică profilul
          </ButtonLink>
        </Card>
        <p className="flex items-center gap-2 text-xs text-ink-muted">
          <TrendingUp aria-hidden className="size-3.5" /> Profilul este salvat doar în acest browser (demo, fără cont pe server).
        </p>
      </section>
    </div>
  );
}

function PortalCard({
  href, icon: Icon, bar, title, text, meta, testId,
}: {
  href: string; icon: typeof BookOpen; bar: "primary" | "accent" | "danger"; title: string; text: string; meta?: string; testId: string;
}) {
  return (
    <Link href={href} className="group block h-full rounded-[var(--radius-card)]" data-testid={testId}>
      <Card bar={bar} className="flex h-full items-start gap-4 pt-7 transition-shadow group-hover:shadow-[var(--shadow-raised)]">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-primary-soft text-primary">
          <Icon aria-hidden className="size-5" />
        </span>
        <span className="min-w-0 flex-1 space-y-1">
          <span className="block text-lg font-semibold text-ink">{title}</span>
          <span className="block text-sm text-ink-muted">{text}</span>
          {meta && <span className="tabular block font-mono text-xs text-ink-muted">{meta}</span>}
        </span>
        <ArrowRight aria-hidden className="mt-1 size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </Card>
    </Link>
  );
}

/** Special portal category: the user's chosen (draft) and confirmed methods, plus history size. */
function MethodsCard({ plans }: { plans: Plans }) {
  const cur = currentGeneration(plans);
  const mine = cur ? methodsOf(plans, cur.id) : [];
  const drafts = mine.filter((m) => m.status === "draft").length;
  const used = mine.length - drafts;
  const past = history(plans).length;
  return (
    <Link
      href="/metode"
      data-testid="portal-methods"
      className="group flex flex-col gap-3 rounded-[var(--radius-card)] border-2 border-accent/40 bg-accent-soft p-5 transition-colors hover:border-accent sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="space-y-1">
        <Eyebrow dot tone="accent">Metodele mele</Eyebrow>
        <span className="block text-lg font-semibold text-ink">Ce ai ales și ce folosești deja</span>
        <span className="tabular block text-sm text-ink-muted" data-testid="portal-methods-counts">
          {drafts} în draft · {used} folosite{past > 0 ? ` · ${past} ${past === 1 ? "profil anterior" : "profiluri anterioare"} în istoric` : ""}
        </span>
      </span>
      <ArrowRight aria-hidden className="size-5 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
