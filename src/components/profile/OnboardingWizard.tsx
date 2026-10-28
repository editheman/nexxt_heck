"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import type { Profile } from "@/lib/storage";
import { actions } from "@/lib/useDemoState";
import { newsletter } from "@/lib/useNewsletter";
import type { Subscriber } from "@/lib/newsletter";
import { FinancialStep, initialFinancial, type FinancialDraft } from "./FinancialStep";
import { IdentityStep, type Identity } from "./IdentityStep";

const STEPS = [
  { title: "Să facem cunoștință", label: "Cine ești?" },
  { title: "Banii tăi, pe scurt", label: "Banii tăi" },
] as const;

export function OnboardingWizard({ initial, subscriber }: { initial: Profile | null; subscriber: Subscriber | null }) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<0 | 1>(0);
  const [identity, setIdentity] = useState<Identity>(() => ({
    alias: initial && !initial.isDemo ? initial.alias : "",
    email: "",
    consent: false,
    ageRange: initial?.ageRange ?? null,
  }));
  const [financial, setFinancial] = useState<FinancialDraft>(() => initialFinancial(initial));
  const s = STEPS[step];

  function go(next: 0 | 1) {
    setStep(next);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function next() {
    // Email is optional; it is stored only together with explicit marketing consent.
    if (!subscriber && identity.email.trim() !== "" && identity.consent) {
      newsletter.subscribe(identity.email, true, "onboarding");
      setIdentity((v) => ({ ...v, email: "", consent: false }));
    }
    go(1);
  }

  function save(f: Omit<Profile, "alias" | "ageRange" | "isDemo">) {
    actions.saveProfile({ ...f, alias: identity.alias.trim(), ageRange: identity.ageRange, isDemo: false });
    router.push("/reality-check");
  }

  return (
    <div className="mx-auto w-full max-w-[680px] space-y-6 short:space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="eyebrow text-ink-muted">Profilul tău</span>
          <span className="flex items-center gap-2 font-semibold text-primary" data-testid="onboarding-step">
            <span aria-hidden className="size-2 rounded-full bg-primary" />
            Pasul {step + 1} din 2: {s.label}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Progres completare profil"
          aria-valuemin={1}
          aria-valuemax={2}
          aria-valuenow={step + 1}
          aria-valuetext={`Pasul ${step + 1} din 2`}
          className="h-1.5 overflow-hidden rounded-full bg-primary-soft"
        >
          <div className={cn("h-full rounded-full bg-primary transition-[width] duration-300", step === 0 ? "w-1/2" : "w-full")} />
        </div>
      </div>

      {/* Visually hidden: the step title stays available to screen readers and as a focus target. */}
      <h1 ref={headingRef} tabIndex={-1} className="sr-only">
        Pasul {step + 1} din 2: {s.title}
      </h1>

      {step === 0 ? (
        <IdentityStep value={identity} onChange={setIdentity} onNext={next} subscriber={subscriber} />
      ) : (
        <FinancialStep draft={financial} onChange={setFinancial} onBack={() => go(0)} onSave={save} />
      )}
    </div>
  );
}
