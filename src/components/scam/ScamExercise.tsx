"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { PortalNext } from "@/components/journey/Onboarding";
import { Alert } from "@/components/ui/Alert";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/components/ui/cn";
import { SCAMS } from "@/content/scams";
import { OFFICIAL_SOURCES } from "@/content/sources";
import { actions, useDemoState } from "@/lib/useDemoState";
import { ScamPlayer } from "./ScamPlayer";

export function ScamExercise() {
  const { state, hydrated } = useDemoState();
  const [activeId, setActiveId] = useState(SCAMS[0].id);
  if (!hydrated) return <PageSkeleton />;

  const activeIndex = SCAMS.findIndex((s) => s.id === activeId);
  const done = SCAMS.filter((s) => state.progress.scams[s.id]).length;

  return (
    <div className="space-y-8">
      <nav aria-label="Scenarii">
        <p className="mb-3 text-sm text-ink-muted" aria-live="polite">
          Ai parcurs {done} din {SCAMS.length} scenarii.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SCAMS.map((s) => {
            const result = state.progress.scams[s.id];
            const active = s.id === activeId;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex h-full min-h-14 w-full items-start justify-between gap-2 rounded-[var(--radius-control)] border px-4 py-3 text-left text-sm font-semibold transition-colors",
                    active ? "border-primary bg-surface text-primary shadow-[var(--shadow-card)]" : "border-border bg-surface/60 text-ink hover:border-border-strong",
                  )}
                >
                  <span>{s.title}</span>
                  {result && (
                    <span className="flex shrink-0 items-center gap-1 text-success">
                      <CheckCircle2 aria-hidden className="size-4" />
                      <span className="sr-only">parcurs,</span>
                      <span className="tabular">{result.correct}/{result.total}</span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <ScamPlayer
        key={activeId}
        scenario={SCAMS[activeIndex]}
        hasNext={activeIndex < SCAMS.length - 1}
        onNext={() => setActiveId(SCAMS[activeIndex + 1].id)}
        onComplete={(correct, total) => actions.recordScam(activeId, correct, total)}
      />

      <Alert tone="info" title="Unde verifici și unde raportezi">
        <ul className="mt-1 space-y-1">
          {OFFICIAL_SOURCES.filter((s) => s.name === "ASF" || s.name === "DNSC").map((s) => (
            <li key={s.name}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2">
                {s.name}
              </a>{" "}
              — {s.topic}
            </li>
          ))}
          <li>Pentru carduri și conturi: banca ta, la numărul de pe spatele cardului sau din aplicația oficială.</li>
        </ul>
      </Alert>

      <PortalNext />
    </div>
  );
}
