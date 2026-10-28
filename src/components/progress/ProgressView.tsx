"use client";

import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { MODULES } from "@/content/modules";
import { SCAMS } from "@/content/scams";
import { computeProgress, isPassed } from "@/lib/progress";
import { useDemoState } from "@/lib/useDemoState";
import { NewsletterSettings } from "@/components/newsletter/NewsletterSettings";
import { ResetDemo } from "./ResetDemo";

const catalog = { moduleSlugs: MODULES.map((m) => m.slug), scamIds: SCAMS.map((s) => s.id) };

export function ProgressView() {
  const { state, hydrated, storageAvailable } = useDemoState();
  if (!hydrated) return <PageSkeleton />;
  const p = computeProgress(state, catalog);

  return (
    <div className="space-y-8">
      {!storageAvailable && (
        <Alert tone="danger" title="Progresul nu poate fi salvat">
          Browserul blochează stocarea locală (de exemplu, în modul privat). Poți folosi aplicația, dar progresul se va
          pierde la reîncărcare.
        </Alert>
      )}

      <Card className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink-muted">Progres total</p>
            <p className="tabular font-heading text-4xl font-semibold text-primary" data-testid="progress-percent">
              {p.percent}%
            </p>
          </div>
          <dl className="tabular grid grid-cols-3 gap-6 text-sm">
            <div>
              <dt className="text-ink-muted">Module citite</dt>
              <dd className="text-xl font-semibold" data-testid="modules-read">{p.modulesRead}/{MODULES.length}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Quiz-uri trecute</dt>
              <dd className="text-xl font-semibold">{p.quizzesPassed}/{MODULES.length}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Scenarii fraudă</dt>
              <dd className="text-xl font-semibold">{p.scamsDone}/{SCAMS.length}</dd>
            </div>
          </dl>
        </div>
        <div
          role="progressbar"
          aria-label="Progres total"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={p.percent}
          className="h-2.5 overflow-hidden rounded-full bg-surface-muted"
        >
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${p.percent}%` }} />
        </div>
      </Card>

      <section aria-labelledby="traseu" className="space-y-3">
        <h2 id="traseu" className="text-xl font-semibold">Traseul demo-ului</h2>
        <ol className="grid gap-2 sm:grid-cols-2">
          {p.journey.map((j) => (
            <li key={j.id}>
              <Link href={j.href} className="flex min-h-12 items-center gap-3 rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2 hover:border-primary">
                {j.done ? <CheckCircle2 aria-hidden className="size-5 text-success" /> : <Circle aria-hidden className="size-5 text-border-strong" />}
                <span className={j.done ? "text-ink" : "text-ink-muted"}>{j.label}</span>
                <span className="sr-only">{j.done ? "(finalizat)" : "(de făcut)"}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="module" className="space-y-3">
        <h2 id="module" className="text-xl font-semibold">Module și quiz-uri</h2>
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-surface">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-surface-muted text-left">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Modul</th>
                <th scope="col" className="px-4 py-3 font-semibold">Citit</th>
                <th scope="col" className="px-4 py-3 font-semibold">Cel mai bun scor</th>
                <th scope="col" className="px-4 py-3 font-semibold"><span className="sr-only">Acțiune</span></th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => {
                const q = state.progress.quizzes[m.slug];
                const read = state.progress.modulesRead[m.slug];
                return (
                  <tr key={m.slug} className="border-t border-border">
                    <th scope="row" className="px-4 py-3 text-left font-normal">{m.title}</th>
                    <td className="px-4 py-3">{read ? "Da" : "Nu"}</td>
                    <td className="tabular px-4 py-3">
                      {q ? (
                        <span className={isPassed(q.best, q.total) ? "font-semibold text-success" : "text-assumption"}>
                          {q.best}/{q.total} {isPassed(q.best, q.total) ? "· trecut" : "· de reluat"}
                        </span>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={q ? `/invata/${m.slug}/quiz` : `/invata/${m.slug}`} className="font-semibold text-primary underline underline-offset-2">
                        {q ? "Reia quiz-ul" : read ? "Fă quiz-ul" : "Începe"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="date" className="space-y-3">
        <h2 id="date" className="text-xl font-semibold">Datele tale</h2>
        <p className="max-w-[68ch] text-ink-muted">
          Tot ce ai introdus este salvat doar în acest browser (localStorage) și rămâne după reîncărcarea paginii. Nu
          trimitem nimic către un server.
        </p>
        <NewsletterSettings />
        <ResetDemo />
      </section>
    </div>
  );
}
