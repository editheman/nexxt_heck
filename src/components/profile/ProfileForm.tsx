"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NumberField } from "@/components/ui/NumberField";
import { cn } from "@/components/ui/cn";
import { GOAL_LABELS, PLACEMENT_LABELS } from "@/content/labels";
import { validateSimInput } from "@/lib/finance";
import { GOALS, PLACEMENTS, type Goal, type Placement, type Profile } from "@/lib/storage";
import { actions } from "@/lib/useDemoState";

type NumKey = "savings" | "nominalPct" | "monthly" | "years";
type Draft = { alias: string; placement: Placement; goal: Goal } & Record<NumKey, number | null>;
type Errors = Partial<Record<NumKey | "alias", string>>;

const FIELD_ORDER: Array<NumKey | "alias"> = ["alias", "savings", "nominalPct", "monthly", "years"];

const FIELD_LABELS: Record<NumKey | "alias", string> = {
  alias: "Cum să te numim",
  savings: "Economii actuale",
  nominalPct: "Randament anual estimat",
  monthly: "Cât pui deoparte lunar",
  years: "Orizont de timp",
};

function validate(d: Draft): Errors {
  const errors: Errors = {};
  if (d.alias.trim().length > 40) errors.alias = "Folosește cel mult 40 de caractere.";
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

export function ProfileForm({ initial }: { initial: Profile | null }) {
  const router = useRouter();
  const summaryRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<Draft>(() => ({
    alias: initial && !initial.isDemo ? initial.alias : "",
    savings: initial?.savings ?? null,
    placement: initial?.placement ?? "cont-curent",
    nominalPct: initial?.nominalPct ?? 0,
    monthly: initial?.monthly ?? 0,
    years: initial?.years ?? 10,
    goal: initial?.goal ?? "fond-urgenta",
  }));
  const [touched, setTouched] = useState<Partial<Record<keyof Errors, true>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(draft);
  const visible = (k: keyof Errors) => (submitted || touched[k] ? errors[k] : undefined);
  const touch = (k: keyof Errors) => setTouched((t) => ({ ...t, [k]: true }));
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const summaryErrors = FIELD_ORDER.filter((k) => errors[k]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (summaryErrors.length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    actions.saveProfile({
      alias: draft.alias.trim(),
      savings: draft.savings!,
      placement: draft.placement,
      nominalPct: draft.nominalPct!,
      monthly: draft.monthly ?? 0,
      years: draft.years!,
      goal: draft.goal,
      isDemo: false,
    });
    router.push("/reality-check");
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6" aria-label="Profil financiar">
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

      <Card className="space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="alias" className="font-semibold">
            {FIELD_LABELS.alias} <span className="font-normal text-ink-muted">(opțional)</span>
          </label>
          <p id="alias-helper" className="text-sm text-ink-muted">
            Un prenume sau un pseudonim. Nu folosi numele complet.
          </p>
          <input
            id="alias"
            name="alias"
            autoComplete="nickname"
            maxLength={60}
            value={draft.alias}
            onChange={(e) => set("alias", e.target.value)}
            onBlur={() => touch("alias")}
            aria-invalid={visible("alias") ? true : undefined}
            aria-describedby={cn("alias-helper", visible("alias") && "alias-error")}
            className={cn(
              "min-h-11 w-full rounded-[var(--radius-control)] border bg-surface px-3 py-2",
              visible("alias") ? "border-danger" : "border-border-strong",
            )}
          />
          {visible("alias") && (
            <p id="alias-error" className="text-sm font-medium text-danger">
              {errors.alias}
            </p>
          )}
        </div>

        <NumberField
          id="savings"
          label={FIELD_LABELS.savings}
          helper="O aproximare e suficientă. Include doar banii pe care îi consideri economii."
          suffix="lei"
          value={draft.savings}
          onChange={(v) => set("savings", v)}
          onBlur={() => touch("savings")}
          error={visible("savings")}
          badge={<Badge kind="user" />}
        />

        <fieldset className="space-y-2">
          <legend className="font-semibold">Unde ții acum acești bani?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {PLACEMENTS.map((p) => (
              <label
                key={p}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] border px-3 py-2 transition-colors",
                  draft.placement === p ? "border-primary bg-surface-muted" : "border-border hover:border-border-strong",
                )}
              >
                <input
                  type="radio"
                  name="placement"
                  value={p}
                  checked={draft.placement === p}
                  onChange={() => set("placement", p)}
                  className="size-4 accent-[var(--color-primary)]"
                />
                <span>{PLACEMENT_LABELS[p]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <NumberField
          id="nominalPct"
          label={FIELD_LABELS.nominalPct}
          helper="Estimarea ta pentru randamentul nominal pe an al acestor bani (de exemplu, dobânda din contract). Dacă nu știi, lasă 0%. Nu completăm automat rate de piață."
          suffix="%"
          value={draft.nominalPct}
          onChange={(v) => set("nominalPct", v)}
          onBlur={() => touch("nominalPct")}
          error={visible("nominalPct")}
          badge={<Badge kind="user" />}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <NumberField
            id="monthly"
            label={FIELD_LABELS.monthly}
            helper="Opțional. Lasă 0 dacă nu economisești lunar."
            suffix="lei"
            value={draft.monthly}
            onChange={(v) => set("monthly", v)}
            onBlur={() => touch("monthly")}
            error={visible("monthly")}
          />
          <NumberField
            id="years"
            label={FIELD_LABELS.years}
            helper="În câți ani ai vrea să folosești banii (0–50)."
            suffix="ani"
            value={draft.years}
            onChange={(v) => set("years", v)}
            onBlur={() => touch("years")}
            error={visible("years")}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="goal" className="font-semibold">
            Obiectivul principal
          </label>
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
      </Card>

      <Alert tone="info" title="Confidențialitate">
        <span className="inline-flex items-start gap-1.5">
          <Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
          Datele rămân doar în acest browser. Nu cerem venitul exact, CNP, IBAN sau date de card.
        </span>
      </Alert>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit">Salvează și vezi Reality Check</Button>
      </div>
    </form>
  );
}
