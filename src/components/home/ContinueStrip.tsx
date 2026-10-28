"use client";

import { Flag } from "lucide-react";
import Link from "next/link";
import { MODULES } from "@/content/modules";
import { SCAMS } from "@/content/scams";
import { computeProgress } from "@/lib/progress";
import { useDemoState } from "@/lib/useDemoState";

const catalog = { moduleSlugs: MODULES.map((m) => m.slug), scamIds: SCAMS.map((s) => s.id) };

export function ContinueStrip() {
  const { state, hydrated } = useDemoState();
  if (!hydrated) return <div className="h-[72px]" aria-hidden />;
  const p = computeProgress(state, catalog);
  const done = p.journey.filter((j) => j.done).length;
  const next = p.journey.find((j) => !j.done);

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <p className="flex items-center gap-3 text-sm text-ink">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Flag aria-hidden className="size-4" />
        </span>
        <span>
          <strong>{done === 0 ? "Începe parcursul:" : "Continuă de unde ai rămas:"}</strong> ai parcurs{" "}
          <span className="tabular">{done}</span> din <span className="tabular">{p.journey.length}</span> pași ai demo-ului.
        </span>
      </p>
      <div className="flex items-center gap-4">
        <div className="h-2 w-28 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
          <div className="h-full rounded-full bg-accent" style={{ width: `${(done / p.journey.length) * 100}%` }} />
        </div>
        <Link href={next?.href ?? "/progres"} className="font-mono text-sm font-medium text-primary underline-offset-2 hover:underline">
          {next ? `${next.label} →` : "Vezi progresul →"}
        </Link>
      </div>
    </div>
  );
}
