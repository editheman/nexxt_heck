"use client";

import { BookOpenCheck, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import type { LearningModule, Question } from "@/content/types";
import { questionsForRetry, scoreQuiz } from "@/lib/quiz";
import { actions } from "@/lib/useDemoState";

type Phase = "answering" | "results";

export function Quiz({ module: m, nextHref }: { module: LearningModule; nextHref: string }) {
  const [questions, setQuestions] = useState<Question[]>(m.quiz);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("answering");
  /** Wrong ids across the whole quiz; a retry only re-asks these. */
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [isRetry, setIsRetry] = useState(false);
  const focusRef = useRef<HTMLHeadingElement>(null);

  const q = questions[index];
  const picked = answers[q.id];
  const focus = () => requestAnimationFrame(() => focusRef.current?.focus());

  function next() {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      const round = scoreQuiz(questions, answers);
      // On a retry, questions answered correctly earlier stay correct.
      const allWrong = round.wrongIds;
      const correct = m.quiz.length - allWrong.length;
      setWrongIds(allWrong);
      actions.recordQuiz(m.slug, correct, m.quiz.length, allWrong);
      setPhase("results");
    }
    focus();
  }

  function restart(retryOnly: boolean) {
    setQuestions(retryOnly ? questionsForRetry(m.quiz, wrongIds) : m.quiz);
    setIsRetry(retryOnly);
    setAnswers({});
    setIndex(0);
    setPhase("answering");
    focus();
  }

  if (phase === "results") {
    const correct = m.quiz.length - wrongIds.length;
    const missed = questionsForRetry(m.quiz, wrongIds);
    return (
      <div className="space-y-6">
        <Card className="space-y-2">
          <h2 ref={focusRef} tabIndex={-1} className="text-2xl font-semibold outline-none" data-testid="quiz-score">
            Scor: {correct} din {m.quiz.length}
          </h2>
          <p className="text-ink-muted">
            {wrongIds.length === 0
              ? "Excelent — ai înțeles toate conceptele din acest modul."
              : "Recitește secțiunile indicate mai jos, apoi reia doar întrebările greșite."}
          </p>
        </Card>

        {missed.length > 0 && (
          <section aria-labelledby="de-recapitulat" className="space-y-3">
            <h3 id="de-recapitulat" className="text-lg font-semibold">
              De recapitulat
            </h3>
            <ul className="space-y-3">
              {missed.map((mq) => {
                const section = m.sections.find((s) => s.id === mq.sectionId)!;
                const correctOpt = mq.options.find((o) => o.id === mq.correctId)!;
                return (
                  <li key={mq.id}>
                    <Card className="space-y-2 p-5">
                      <p className="font-semibold">{mq.prompt}</p>
                      <p className="text-sm">
                        <span className="font-semibold text-success">Răspuns corect:</span> {correctOpt.text}
                      </p>
                      <p className="text-sm text-ink-muted">{correctOpt.explanation}</p>
                      <Link
                        href={`/invata/${m.slug}#${section.id}`}
                        className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline underline-offset-2"
                      >
                        <BookOpenCheck aria-hidden className="size-4" />
                        Recitește: {section.title}
                      </Link>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {missed.length > 0 && <Button onClick={() => restart(true)}>Reia doar întrebările greșite ({missed.length})</Button>}
          <Button variant="secondary" onClick={() => restart(false)}>
            <RotateCcw aria-hidden className="size-4" /> Reia tot quiz-ul
          </Button>
          <ButtonLink href={nextHref} variant={missed.length > 0 ? "ghost" : "primary"}>
            {nextHref === "/progres" ? "Vezi progresul" : "Modulul următor"}
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between gap-2 text-sm font-semibold text-ink-muted">
        <span>
          {isRetry ? "Reluare · " : ""}Întrebarea {index + 1} din {questions.length}
        </span>
        <span aria-hidden className="flex gap-1">
          {questions.map((qq, i) => (
            <span key={qq.id} className={cn("h-1.5 w-6 rounded-full", i <= index ? "bg-primary" : "bg-surface-muted")} />
          ))}
        </span>
      </div>
      <h2 ref={focusRef} tabIndex={-1} className="text-xl font-semibold outline-none">
        {q.prompt}
      </h2>
      <div role="group" aria-label={q.prompt} className="space-y-2">
        {q.options.map((o) => {
          const reveal = Boolean(picked);
          const isPicked = picked === o.id;
          const isCorrect = o.id === q.correctId;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={isPicked}
              aria-disabled={reveal && !isPicked ? true : undefined}
              onClick={() => !picked && setAnswers((a) => ({ ...a, [q.id]: o.id }))}
              className={cn(
                "flex min-h-12 w-full items-start gap-3 rounded-[var(--radius-control)] border px-4 py-3 text-left transition-colors",
                !reveal && "border-border-strong hover:border-primary hover:bg-surface-muted",
                reveal && isCorrect && "border-success bg-success-soft",
                reveal && isPicked && !isCorrect && "border-danger bg-danger-soft",
                reveal && !isPicked && !isCorrect && "border-border opacity-70",
              )}
            >
              {reveal && isCorrect && <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />}
              {reveal && isPicked && !isCorrect && <XCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />}
              <span>
                {o.text}
                {reveal && isCorrect && <span className="sr-only"> (răspuns corect)</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" data-testid="quiz-feedback">
        {picked && (
          <div className={cn("space-y-2 rounded-[var(--radius-control)] p-4", picked === q.correctId ? "bg-success-soft" : "bg-danger-soft")}>
            <p className={cn("font-semibold", picked === q.correctId ? "text-success" : "text-danger")}>
              {picked === q.correctId ? "Corect" : "Incorect"}
            </p>
            <p>{q.options.find((o) => o.id === picked)!.explanation}</p>
            {picked !== q.correctId && (
              <p className="text-sm">
                <span className="font-semibold">Răspunsul corect:</span> {q.options.find((o) => o.id === q.correctId)!.text}.{" "}
                {q.options.find((o) => o.id === q.correctId)!.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {picked && <Button onClick={next}>{index + 1 < questions.length ? "Întrebarea următoare" : "Vezi rezultatul"}</Button>}
    </Card>
  );
}
