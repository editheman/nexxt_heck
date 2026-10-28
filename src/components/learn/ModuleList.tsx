"use client";

import { CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MODULES } from "@/content/modules";
import { useDemoState } from "@/lib/useDemoState";

export function ModuleList() {
  const { state, hydrated } = useDemoState();
  return (
    <ol className="grid gap-4 md:grid-cols-2">
      {MODULES.map((m, i) => {
        const read = hydrated && state.progress.modulesRead[m.slug];
        const quiz = hydrated ? state.progress.quizzes[m.slug] : undefined;
        return (
          <li key={m.slug}>
            <Link href={`/invata/${m.slug}`} className="group block h-full rounded-[var(--radius-card)]">
              <Card className="flex h-full flex-col gap-3 border border-transparent transition-colors group-hover:border-primary">
                <div className="flex items-center justify-between gap-2 text-sm text-ink-muted">
                  <span className="tabular font-semibold">Modulul {i + 1}</span>
                  <span className="flex items-center gap-1">
                    <Clock aria-hidden className="size-4" /> {m.minutes} min
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-primary">{m.title}</h2>
                <p className="flex-1 text-ink-muted">{m.summary}</p>
                <div className="flex flex-wrap gap-3 text-sm font-semibold">
                  {read ? (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 aria-hidden className="size-4" /> Citit
                    </span>
                  ) : (
                    <span className="text-ink-muted">Necitit</span>
                  )}
                  {quiz && (
                    <span className="tabular text-accent">
                      Quiz: {quiz.best}/{quiz.total}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
