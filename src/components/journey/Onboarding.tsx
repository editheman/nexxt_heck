"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { actions, useDemoState } from "@/lib/useDemoState";
import { NextStep } from "./NextStep";

export const ONBOARDING_STEPS = 3;

/** True once the guided profiling (profil → Reality Check → simulator) is finished. */
export function useOnboardingDone() {
  const { state, hydrated } = useDemoState();
  return { done: state.onboarding.completedAt !== null, hydrated };
}

/** Page eyebrow: „Pasul n din 4” during profiling, a link back to the portal afterwards. */
export function OnboardingStep({ n }: { n: number }) {
  const { done, hydrated } = useOnboardingDone();
  if (!hydrated) return <span aria-hidden className="block h-4" />;
  if (done) return <PortalBackLink />;
  return (
    <Eyebrow dot>
      Profilare · Pasul {n} din {ONBOARDING_STEPS}
    </Eyebrow>
  );
}

export function PortalBackLink() {
  return (
    <Link href="/portal" className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
      <ArrowLeft aria-hidden className="size-4" /> Portalul tău
    </Link>
  );
}

const PORTAL = { href: "/portal", label: "Înapoi în portalul tău", hint: "De acolo ajungi la toate secțiunile." };

/** „Pasul următor” during profiling; afterwards the pages are not chained and point back to the portal. */
export function OnboardingNext({ href, label, hint }: { href: string; label: string; hint?: string }) {
  const { done, hydrated } = useOnboardingDone();
  if (!hydrated) return null;
  return done ? <NextStep {...PORTAL} /> : <NextStep href={href} label={label} hint={hint} />;
}

export function PortalNext() {
  return <NextStep {...PORTAL} />;
}

/** Last step of the profiling (end of the simulator page). */
export function FinishOnboarding() {
  const router = useRouter();
  const { done, hydrated } = useOnboardingDone();
  if (!hydrated) return null;
  if (done) return <NextStep {...PORTAL} />;
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-primary/30 bg-primary-soft p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Eyebrow dot>Ultimul pas</Eyebrow>
        <p className="text-lg font-semibold text-ink">Profilarea e gata</p>
        <p className="text-sm text-ink-muted">În portalul tău găsești modulele recomandate, scenariile de fraudă și progresul.</p>
      </div>
      <Button
        onClick={() => {
          actions.completeOnboarding();
          router.push("/portal");
        }}
      >
        Finalizează și deschide portalul <ArrowRight aria-hidden className="size-4" />
      </Button>
    </div>
  );
}
