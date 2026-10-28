"use client";

import { ArrowRight, Newspaper, Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { useOnboardingDone } from "@/components/journey/Onboarding";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MARKET_FACTS, type MarketFact } from "@/content/marketFacts";
import { sourceByName } from "@/content/sources";

export const DIALOG_SECONDS = 10;
const TICK_MS = 100;
const NEXT = "/profil";

/**
 * "Începe demo-ul" → a short "Știai că?" interstitial with one official-data fact.
 * Continues to the profile after DIALOG_SECONDS; "Sari peste" continues now, "Pauză" stops
 * the timer (WCAG 2.2.1), Esc cancels and stays on the page. The timer also stops while the
 * tab is hidden.
 */
export function StartDemoButton() {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [fact, setFact] = useState<MarketFact | null>(null);
  const { done } = useOnboardingDone();

  function open() {
    router.prefetch(NEXT);
    setFact(MARKET_FACTS[Math.floor(Math.random() * MARKET_FACTS.length)]);
    ref.current?.showModal();
  }

  function close() {
    ref.current?.close();
    setFact(null);
  }

  if (done) {
    return (
      <ButtonLink href="/portal" className="min-h-12 px-7 text-base">
        Deschide portalul tău <ArrowRight aria-hidden className="size-4" />
      </ButtonLink>
    );
  }

  return (
    <>
      <Button onClick={open} className="min-h-12 px-7 text-base">
        Începe demo-ul <ArrowRight aria-hidden className="size-4" />
      </Button>
      <dialog
        ref={ref}
        aria-labelledby="fact-title"
        onClose={() => setFact(null)}
        className="m-auto w-[min(92vw,520px)] rounded-[var(--radius-card)] bg-surface p-0 text-left text-ink shadow-[var(--shadow-raised)] backdrop:bg-ink/45 backdrop:backdrop-blur-sm"
      >
        {fact && (
          <FactPanel
            fact={fact}
            onContinue={() => {
              close();
              router.push(NEXT);
            }}
          />
        )}
      </dialog>
    </>
  );
}

function FactPanel({ fact, onContinue }: { fact: MarketFact; onContinue: () => void }) {
  const [remaining, setRemaining] = useState(DIALOG_SECONDS * 1000);
  const [paused, setPaused] = useState(false);
  const done = useRef(false);
  const src = sourceByName(fact.source);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setRemaining((r) => Math.max(0, r - TICK_MS));
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  useEffect(() => {
    if (remaining === 0 && !done.current) {
      done.current = true;
      onContinue();
    }
  }, [remaining, onContinue]);

  const seconds = Math.ceil(remaining / 1000);
  const progress = 1 - remaining / (DIALOG_SECONDS * 1000);

  return (
    <div className="space-y-5 p-6 sm:p-8">
      <div aria-hidden className="h-1 overflow-hidden rounded-full bg-primary-soft">
        <div className="h-full rounded-full bg-primary transition-[width] duration-100 ease-linear" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Eyebrow dot icon={<Newspaper aria-hidden className="size-3.5" />}>
          Știai că?
        </Eyebrow>
        <Badge kind="official">Date oficiale {fact.source}</Badge>
      </div>

      <div className="space-y-3">
        <h2 id="fact-title" className="text-2xl leading-snug text-ink" data-testid="fact-headline">
          {fact.headline}
        </h2>
        <p className="text-ink-muted">{fact.detail}</p>
        <p className="font-mono text-xs text-ink-muted">
          Sursa:{" "}
          <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
            {fact.source}
          </a>{" "}
          · {fact.period} · cele mai recente date anuale din aplicație
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="min-h-10 px-3 text-sm" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
            {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
            {paused ? "Reia" : "Pauză"}
          </Button>
          <p className="tabular text-sm text-ink-muted" data-testid="fact-countdown">
            {paused ? "În pauză" : `Continui automat în ${seconds} s`}
          </p>
        </div>
        <Button onClick={onContinue} autoFocus>
          Sari peste <ArrowRight aria-hidden className="size-4" />
        </Button>
      </div>
      <p className="sr-only" aria-live="polite">
        {paused ? "Numărătoarea este în pauză." : `Demo-ul continuă automat în ${DIALOG_SECONDS} secunde.`}
      </p>
    </div>
  );
}
