"use client";

import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NumberField } from "@/components/ui/NumberField";
import { GOAL_LABELS } from "@/content/labels";
import { validateSimInput } from "@/lib/finance";
import { GOALS, PLACEMENTS, type Goal, type Placement, type Profile } from "@/lib/storage";
import { cn } from "@/components/ui/cn";

type NumKey = "savings" | "nominalPct" | "monthly" | "years";
export type FinancialDraft = { placement: Placement; goal: Goal } & Record<NumKey, number | null>;
type Draft = FinancialDraft;
type Errors = Partial<Record<NumKey, string>>;

/** Short labels so the five options fit one row in the compact onboarding card. */
const PLACEMENT_SHORT: Record<Placement, string> = {
  numerar: "Numerar",
  "cont-curent": "Cont curent",
  depozit: "Depozit",
  investitii: "Investiții",
  mix: "Un mix",
};

const FIELD_ORDER: NumKey[] = ["savings", "nominalPct", "monthly", "years"];

const FIELD_LABELS: Record<NumKey, string> = {
  savings: "Economii actuale",
  nominalPct: "Randament anual estimat",
  monthly: "Cât pui deoparte lunar",
  years: "Orizont de timp",
};

function validate(d: Draft): Errors {
  const errors: Errors = {};
  if (d.savings === null) errors.savings = "Introdu suma aproximativă a economiilor (poate fi 0).";
  if (d.years === null) errors.years = "Introdu numărul de ani.";
  if (d.nominalPct === null) errors.nominalPct = "Introdu un procent (poate fi 0).";

  const sim = validateSimInput({
    principal: d.savings ?? 0,
    monthly: d.monthly ?? 0,
    nominalPct: d.nominalPct ?? 0,
    inflationPct: 0,
    years: d.years ?? 0,
  });
  errors.savings ??= sim.principal;
  errors.monthly ??= sim.monthly;
  errors.nominalPct ??= sim.nominalPct;
  errors.years ??= sim.years;

  for (const k of Object.keys(errors) as Array<keyof Errors>) if (!errors[k]) delete errors[k];
  return errors;
}

export function initialFinancial(initial: Profile | null): FinancialDraft {
  return {
    savings: initial?.savings ?? null,
    placement: initial?.placement ?? "cont-curent",
    nominalPct: initial?.nominalPct ?? 0,
    monthly: initial?.monthly ?? 0,
    years: initial?.years ?? 10,
    goal: initial?.goal ?? "fond-urgenta",
  };
}

/** Onboarding step 2: the financial questions. Values live in the wizard so "Înapoi" keeps them. */
export function FinancialStep({
  draft,
  onChange,
  onBack,
  onSave,
}: {
  draft: FinancialDraft;
  onChange: (d: FinancialDraft) => void;
  onBack: () => void;
  onSave: (p: Omit<Profile, "alias" | "ageRange" | "isDemo">) => void;
}) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState<Partial<Record<keyof Errors, true>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(draft);
  const visible = (k: keyof Errors) => (submitted || touched[k] ? errors[k] : undefined);
  const touch = (k: keyof Errors) => setTouched((t) => ({ ...t, [k]: true }));
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => onChange({ ...draft, [k]: v });
  const summaryErrors = FIELD_ORDER.filter((k) => errors[k]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (summaryErrors.length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    onSave({
      savings: draft.savings!,
      placement: draft.placement,
      nominalPct: draft.nominalPct!,
      monthly: draft.monthly ?? 0,
      years: draft.years!,
      goal: draft.goal,
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4" aria-label="Pasul 2: datele financiare">
      {submitted && summaryErrors.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="error-summary-title"
          className="rounded-[var(--radius-control)] border-2 border-danger bg-danger-soft p-4 outline-none"
        >
          <h2 id="error-summary-title" className="text-base font-semibold text-danger">
            Verifică {summaryErrors.length === 1 ? "câmpul de mai jos" : `cele ${summaryErrors.length} câmpuri de mai jos`}
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {summaryErrors.map((k) => (
              <li key={k}>
                <a href={`#${k}`} className="text-danger underline underline-offset-2">
                  {FIELD_LABELS[k]}: {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Card className="space-y-5 p-5 sm:p-7 short:space-y-4 short:sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            id="savings"
            label={FIELD_LABELS.savings}
            helper="O aproximare e suficientă."
            suffix="lei"
            value={draft.savings}
            onChange={(v) => set("savings", v)}
            onBlur={() => touch("savings")}
            error={visible("savings")}
            badge={<Badge kind="user" />}
          />
          <NumberField
            id="nominalPct"
            label={FIELD_LABELS.nominalPct}
            helper="Ex. dobânda din contract. Dacă nu știi, lasă 0%."
            suffix="%"
            value={draft.nominalPct}
            onChange={(v) => set("nominalPct", v)}
            onBlur={() => touch("nominalPct")}
            error={visible("nominalPct")}
            badge={<Badge kind="user" />}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="font-semibold">Unde ții acum acești bani?</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PLACEMENTS.map((p) => (
              <label
                key={p}
                className={cn(
                  "flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border px-2 text-center text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
                  draft.placement === p ? "border-primary bg-primary-soft text-primary" : "border-border text-ink hover:border-border-strong",
                )}
              >
                <input
                  type="radio"
                  name="placement"
                  value={p}
                  checked={draft.placement === p}
                  onChange={() => set("placement", p)}
                  className="sr-only"
                />
                {PLACEMENT_SHORT[p]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-3">
          <NumberField
            id="monthly"
            label={FIELD_LABELS.monthly}
            helper="Opțional."
            suffix="lei"
            value={draft.monthly}
            onChange={(v) => set("monthly", v)}
            onBlur={() => touch("monthly")}
            error={visible("monthly")}
          />
          <NumberField
            id="years"
            label={FIELD_LABELS.years}
            helper="Între 0 și 50."
            suffix="ani"
            value={draft.years}
            onChange={(v) => set("years", v)}
            onBlur={() => touch("years")}
            error={visible("years")}
          />
          <div className="space-y-1.5">
            <label htmlFor="goal" className="font-semibold">
              Obiectivul principal
            </label>
            <p className="text-sm text-ink-muted">Pentru ce economisești.</p>
            <select
              id="goal"
              value={draft.goal}
              onChange={(e) => set("goal", e.target.value as Goal)}
              className="min-h-11 w-full rounded-[var(--radius-control)] border border-border-strong bg-surface px-3 py-2"
            >
              {GOALS.map((g) => (
                <option key={g} value={g}>
                  {GOAL_LABELS[g]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft aria-hidden className="size-4" /> Înapoi
          </Button>
          {/* preventDefault on mousedown keeps focus in the field until click, so a blur-triggered
              inline error cannot shift the button away between mousedown and mouseup. */}
          <Button type="submit" onMouseDown={(e) => e.preventDefault()}>
            Salvează și vezi Reality Check
          </Button>
        </div>
      </Card>
    </form>
  );
}
