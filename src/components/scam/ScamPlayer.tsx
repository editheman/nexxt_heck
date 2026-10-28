"use client";

import { CheckCircle2, MessageSquareWarning, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import type { ScamScenario } from "@/content/types";

export function ScamPlayer({
  scenario,
  onComplete,
  onNext,
  hasNext,
}: {
  scenario: ScamScenario;
  onComplete: (correct: number, total: number) => void;
  onNext: () => void;
  hasNext: boolean;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  const done = stepIndex >= scenario.steps.length;
  const step = scenario.steps[Math.min(stepIndex, scenario.steps.length - 1)];
  const picked = answers[step.id];
  const pickedChoice = step.choices.find((c) => c.id === picked);

  function choose(choiceId: string) {
    if (picked) return;
    setAnswers((a) => ({ ...a, [step.id]: choiceId }));
  }

  function advance() {
    const next = stepIndex + 1;
    setStepIndex(next);
    if (next >= scenario.steps.length) {
      const all = { ...answers };
      const correct = scenario.steps.filter((s) => s.choices.find((c) => c.id === all[s.id])?.correct).length;
      onComplete(correct, scenario.steps.length);
    }
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  const correctCount = scenario.steps.filter((s) => s.choices.find((c) => c.id === answers[s.id])?.correct).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Card className="space-y-4 self-start">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
            <MessageSquareWarning aria-hidden className="size-4" /> {scenario.channel}
          </p>
          <Badge kind="fictional" />
        </div>
        <p className="text-sm text-ink-muted">De la: {scenario.sender}</p>
        <div className="space-y-2" aria-label="Mesajul primit">
          {scenario.message.map((m, i) => (
            <p key={i} className="max-w-[46ch] rounded-2xl rounded-tl-sm bg-surface-muted px-4 py-3 text-[0.975rem]">
              {m}
            </p>
          ))}
        </div>
        <p className="text-xs text-ink-muted">Mesaj fictiv creat pentru exercițiu. Linkurile și numerele nu sunt reale.</p>
      </Card>

      <div className="space-y-4">
        {!done ? (
          <Card className="space-y-4">
            <p className="text-sm font-semibold text-ink-muted">
              Întrebarea {stepIndex + 1} din {scenario.steps.length}
            </p>
            <h3 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
              {step.prompt}
            </h3>
            <div role="group" aria-label={step.prompt} className="space-y-2">
              {step.choices.map((c) => {
                const isPicked = picked === c.id;
                const reveal = Boolean(picked);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => choose(c.id)}
                    aria-pressed={isPicked}
                    aria-disabled={reveal && !isPicked ? true : undefined}
                    className={cn(
                      "flex min-h-12 w-full items-start gap-3 rounded-[var(--radius-control)] border px-4 py-3 text-left transition-colors",
                      !reveal && "border-border-strong hover:border-primary hover:bg-surface-muted",
                      reveal && c.correct && "border-success bg-success-soft",
                      reveal && isPicked && !c.correct && "border-danger bg-danger-soft",
                      reveal && !isPicked && !c.correct && "border-border opacity-70",
                    )}
                  >
                    {reveal && c.correct && <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />}
                    {reveal && isPicked && !c.correct && <XCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />}
                    <span>
                      {c.text}
                      {reveal && c.correct && <span className="sr-only"> (răspunsul sigur)</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            <div aria-live="polite">
              {pickedChoice && (
                <div
                  className={cn(
                    "space-y-1 rounded-[var(--radius-control)] p-4",
                    pickedChoice.correct ? "bg-success-soft" : "bg-danger-soft",
                  )}
                >
                  <p className={cn("font-semibold", pickedChoice.correct ? "text-success" : "text-danger")}>
                    {pickedChoice.correct ? "Corect" : "Nu chiar"}
                  </p>
                  <p>{pickedChoice.feedback}</p>
                </div>
              )}
            </div>
            {picked && (
              <Button onClick={advance}>{stepIndex + 1 < scenario.steps.length ? "Continuă" : "Vezi rezumatul"}</Button>
            )}
          </Card>
        ) : (
          <Card className="space-y-5">
            <h3 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
              Rezumat: {correctCount} din {scenario.steps.length} răspunsuri sigure
            </h3>
            <div className="space-y-2">
              <p className="font-semibold text-danger">Semnale de alarmă</p>
              <ul className="list-disc space-y-1 pl-5">
                {scenario.redFlags.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-success">Ce faci concret</p>
              <ul className="list-disc space-y-1 pl-5">
                {scenario.safeSteps.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            {hasNext && <Button onClick={onNext}>Scenariul următor</Button>}
          </Card>
        )}
      </div>
    </div>
  );
}
