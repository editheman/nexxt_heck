"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import type { Profile } from "@/lib/storage";
import { useAuth, auth } from "@/lib/useAuth";
import { actions, useDemoState } from "@/lib/useDemoState";
import { FinancialStep, initialFinancial, type FinancialDraft } from "./FinancialStep";
import { IdentityStep, type Identity, type IdentityErrors } from "./IdentityStep";

const STEPS = [
  { title: "Să facem cunoștință", label: "Cine ești?" },
  { title: "Banii tăi, pe scurt", label: "Banii tăi" },
] as const;

export function OnboardingWizard({ initial }: { initial: Profile | null }) {
  const router = useRouter();
  const { state } = useDemoState();
  const { account } = useAuth();
  // Whether this wizard run creates the account (label only); the fields follow the live login state.
  const [mode] = useState<"signup" | "edit">(() => (account ? "edit" : "signup"));
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<0 | 1>(0);
  const [identity, setIdentity] = useState<Identity>(() => ({
    username: account?.username ?? "",
    password: "",
    confirm: "",
    ageRange: initial?.ageRange ?? null,
  }));
  const [financial, setFinancial] = useState<FinancialDraft>(() => initialFinancial(initial));
  const s = STEPS[step];

  function go(next: 0 | 1) {
    setStep(next);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  async function next(): Promise<IdentityErrors | null> {
    if (!account) {
      const r = await auth.signUp({ username: identity.username, password: identity.password, confirm: identity.confirm });
      if (!r.ok) return r.errors;
    }
    // Never keep the password in memory longer than needed.
    setIdentity((v) => ({ ...v, password: "", confirm: "" }));
    go(1);
    return null;
  }

  function save(f: Omit<Profile, "alias" | "ageRange" | "isDemo">) {
    actions.saveProfile({ ...f, alias: account?.username ?? identity.username.trim(), ageRange: identity.ageRange, isDemo: false });
    // During profiling continue the chain; when editing later, return to the portal.
    router.push(state.onboarding.completedAt ? "/portal" : "/reality-check");
  }

  return (
    <div className="mx-auto w-full max-w-[680px] space-y-6 short:space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="eyebrow text-ink-muted">{mode === "signup" ? "Creează cont" : "Profilul tău"}</span>
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
        <IdentityStep value={identity} onChange={setIdentity} onNext={next} mode={account ? "edit" : "signup"} />
      ) : (
        <FinancialStep draft={financial} onChange={setFinancial} onBack={() => go(0)} onSave={save} />
      )}
    </div>
  );
}
