"use client";

import { CheckCircle2, Clock, Pencil, Target } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/components/ui/cn";
import { GOAL_PATHS } from "@/content/goalPaths";
import { GOAL_LABELS } from "@/content/labels";
import { MODULES } from "@/content/modules";
import type { LearningModule } from "@/content/types";
import { modulesForGoal, otherModules } from "@/lib/goals";
import type { DemoState } from "@/lib/storage";
import { useDemoState } from "@/lib/useDemoState";

/** Învață: modules for the profile's savings goal first, then everything else. */
export function ModuleList() {
  const { state, hydrated } = useDemoState();
  if (!hydrated) return <PageSkeleton />;

  const goal = state.profile?.goal;
  if (!goal) {
    return (
      <div className="space-y-6">
        <p className="rounded-[var(--radius-control)] bg-surface-muted px-4 py-3 text-sm text-ink">
          <Link href="/profil" className="font-semibold text-primary underline underline-offset-2">Completează profilul</Link>{" "}
          și alege pentru ce economisești — îți arătăm întâi modulele potrivite obiectivului tău.
        </p>
        <Grid modules={MODULES} state={state} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section aria-labelledby="pentru-tine" className="space-y-5" data-testid="goal-path">
        <div className="space-y-2">
          <Eyebrow dot icon={<Target aria-hidden className="size-3.5" />}>
            Pentru obiectivul tău
          </Eyebrow>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="pentru-tine" className="text-2xl text-ink" data-testid="goal-title">
              {GOAL_LABELS[goal]}
            </h2>
            <Link href="/profil" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              <Pencil aria-hidden className="size-4" /> Schimbă obiectivul
            </Link>
          </div>
          <p className="max-w-[68ch] text-ink-muted">{GOAL_PATHS[goal].intro}</p>
        </div>
        <Grid modules={modulesForGoal(goal)} state={state} numbered highlight />
      </section>

      <section aria-labelledby="alte-module" className="space-y-5">
        <h2 id="alte-module" className="text-xl text-ink">Alte module</h2>
        <Grid modules={otherModules(goal)} state={state} />
      </section>
    </div>
  );
}

function Grid({ modules, state, numbered, highlight }: { modules: LearningModule[]; state: DemoState; numbered?: boolean; highlight?: boolean }) {
  return (
    <ol className="grid gap-4 md:grid-cols-2">
      {modules.map((m, i) => {
        const read = state.progress.modulesRead[m.slug];
        const quiz = state.progress.quizzes[m.slug];
        return (
          <li key={m.slug}>
            <Link href={`/invata/${m.slug}`} className="group block h-full rounded-[var(--radius-card)]">
              <Card
                bar={highlight ? "primary" : undefined}
                className={cn("flex h-full flex-col gap-3 border border-transparent transition-colors group-hover:border-primary", highlight && "pt-7")}
              >
                <div className="flex items-center justify-between gap-2 text-sm text-ink-muted">
                  <span className="tabular font-semibold">{numbered ? `Pasul ${i + 1}` : "Modul"}</span>
                  <span className="flex items-center gap-1">
                    <Clock aria-hidden className="size-4" /> {m.minutes} min
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-primary">{m.title}</h3>
                <p className="flex-1 text-ink-muted">{m.summary}</p>
                <div className="flex flex-wrap gap-3 text-sm font-semibold">
                  {read ? (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 aria-hidden className="size-4" /> Citit
                    </span>
                  ) : (
                    <span className="text-ink-muted">Necitit</span>
                  )}
                  {quiz && <span className="tabular text-accent">Quiz: {quiz.best}/{quiz.total}</span>}
                </div>
              </Card>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
