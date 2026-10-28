"use client";

import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useOnboardingDone } from "@/components/journey/Onboarding";
import { Button } from "@/components/ui/Button";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/components/ui/cn";
import { TOPICS, type TopicId } from "@/content/topics";
import { actions, useDemoState } from "@/lib/useDemoState";

export function TopicsPicker() {
  const { state, hydrated } = useDemoState();
  if (!hydrated) return <PageSkeleton />;
  return <Picker initial={state.interests} />;
}

function Picker({ initial }: { initial: TopicId[] }) {
  const router = useRouter();
  const { done } = useOnboardingDone();
  const [selected, setSelected] = useState<TopicId[]>(initial);
  const [error, setError] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const toggle = (id: TopicId) => {
    setError(false);
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) {
      setError(true);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    // Keep the catalogue order so recommendations are stable.
    actions.setInterests(TOPICS.map((t) => t.id).filter((id) => selected.includes(id)));
    router.push(done ? "/portal" : "/simulator");
  }

  return (
    <form noValidate onSubmit={save} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="sr-only">Teme care te interesează</legend>
        <ul className="grid gap-3 sm:grid-cols-2">
          {TOPICS.map((t) => {
            const on = selected.includes(t.id);
            return (
              <li key={t.id}>
                <label
                  className={cn(
                    "flex h-full min-h-20 cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border bg-surface p-4 shadow-[var(--shadow-card)] transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
                    on ? "border-primary bg-primary-soft" : "border-border hover:border-border-strong",
                  )}
                >
                  <input type="checkbox" checked={on} onChange={() => toggle(t.id)} className="sr-only" />
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border",
                      on ? "border-primary bg-primary text-on-primary" : "border-border-strong bg-surface",
                    )}
                  >
                    {on && <Check className="size-4" />}
                  </span>
                  <span className="space-y-0.5">
                    <span className="block font-semibold text-ink">{t.label}</span>
                    <span className="block text-sm text-ink-muted">{t.question}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div aria-live="polite">
        {error && (
          <p ref={errorRef} tabIndex={-1} className="text-sm font-medium text-danger outline-none">
            Alege cel puțin o temă — o poți schimba oricând din portal.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {selected.length === 0 ? "Nicio temă aleasă" : selected.length === 1 ? "1 temă aleasă" : `${selected.length} teme alese`}
        </p>
        <Button type="submit">
          {done ? "Salvează interesele" : "Salvează și continuă spre simulator"} <ArrowRight aria-hidden className="size-4" />
        </Button>
      </div>
    </form>
  );
}
