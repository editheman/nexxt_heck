"use client";

import { cn } from "@/components/ui/cn";
import type { RiskProfile } from "@/lib/storage";

type Q<K extends keyof RiskProfile> = {
  key: K;
  legend: string;
  help: string;
  options: Array<{ value: NonNullable<RiskProfile[K]>; label: string }>;
};

const QUESTIONS = [
  {
    key: "emergencyFund",
    legend: "Ai un fond de urgență?",
    help: "Bani puși deoparte pentru neprevăzut, care acoperă câteva luni de cheltuieli esențiale.",
    options: [
      { value: "da", label: "Da" },
      { value: "partial", label: "Parțial" },
      { value: "nu", label: "Nu încă" },
    ],
  } satisfies Q<"emergencyFund">,
  {
    key: "riskTolerance",
    legend: "Dacă economiile tale ar scădea temporar cu o cincime, ce ai face?",
    help: "Nu există răspuns corect — ne ajută să nu-ți arătăm categorii cu care n-ai fi confortabil.",
    options: [
      { value: "scazuta", label: "Aș retrage banii" },
      { value: "medie", label: "Aș aștepta liniștit" },
      { value: "ridicata", label: "Aș pune mai mulți bani" },
    ],
  } satisfies Q<"riskTolerance">,
  {
    key: "experience",
    legend: "Ai mai investit (fonduri, acțiuni, titluri de stat)?",
    help: "Ne ajută să știm cât de mult să explicăm.",
    options: [
      { value: "deloc", label: "Deloc" },
      { value: "putina", label: "Puțin" },
      { value: "multa", label: "Da, des" },
    ],
  } satisfies Q<"experience">,
] as const;

/** Three short questions stored in `riskProfile`; each answer can be cleared by clicking it again. */
export function RiskQuestions({ value, onChange }: { value: RiskProfile; onChange: (v: RiskProfile) => void }) {
  return (
    <div className="space-y-6">
      {QUESTIONS.map((q) => (
        <fieldset key={q.key} className="space-y-2">
          <legend className="font-semibold text-ink">{q.legend}</legend>
          <p className="text-sm text-ink-muted">{q.help}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {q.options.map((o) => {
              const on = value[q.key] === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ ...value, [q.key]: on ? null : o.value })}
                  className={cn(
                    "min-h-11 rounded-[var(--radius-control)] border px-3 text-sm font-semibold transition-colors",
                    on ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-ink hover:border-border-strong",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
