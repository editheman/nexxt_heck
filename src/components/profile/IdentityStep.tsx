"use client";

import { ArrowRight, Info, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { CONSENT_TEXT } from "@/content/consent";
import { maskEmail, validateEmail, type Subscriber } from "@/lib/newsletter";
import { AGE_RANGES, type AgeRange } from "@/lib/storage";

export type Identity = { alias: string; email: string; consent: boolean; ageRange: AgeRange | null };
type Errors = Partial<Record<"alias" | "email" | "consent", string>>;

const AGE_LABELS: Record<AgeRange, string> = { "20-25": "20–25 ani", "26-30": "26–30 ani", "31-35": "31–35 ani" };

export function validateIdentity(d: Identity, subscribed: boolean): Errors {
  const e: Errors = {};
  const alias = d.alias.trim();
  if (alias === "") e.alias = "Spune-ne cum să-ți spunem — un prenume sau un pseudonim.";
  else if (alias.length > 40) e.alias = "Folosește cel mult 40 de caractere.";
  if (!subscribed && d.email.trim() !== "") {
    const v = validateEmail(d.email);
    if (!v.ok) e.email = v.error;
    if (!d.consent) e.consent = "Bifează acordul pentru digest sau lasă adresa de e-mail goală.";
  }
  return e;
}

const fieldShell = (invalid: boolean) =>
  cn(
    "flex min-h-12 items-center gap-3 rounded-[var(--radius-control)] border bg-bg px-3 transition-colors focus-within:border-primary focus-within:bg-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
    invalid ? "border-danger" : "border-border",
  );

export function IdentityStep({
  value,
  onChange,
  onNext,
  subscriber,
}: {
  value: Identity;
  onChange: (v: Identity) => void;
  onNext: () => void;
  subscriber: Subscriber | null;
}) {
  const [submitted, setSubmitted] = useState(false);
  const aliasRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const errors = submitted ? validateIdentity(value, subscriber !== null) : {};
  const set = <K extends keyof Identity>(k: K, v: Identity[K]) => onChange({ ...value, [k]: v });
  const showConsent = !subscriber && value.email.trim() !== "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validateIdentity(value, subscriber !== null);
    const first = errs.alias ? aliasRef : errs.email ? emailRef : errs.consent ? consentRef : null;
    if (first) {
      first.current?.focus();
      return;
    }
    onNext();
  }

  return (
    <form noValidate onSubmit={submit} aria-label="Pasul 1: cine ești">
      <Card className="space-y-6 p-6 sm:p-8">
        <div className="space-y-2">
          <label htmlFor="alias" className="flex items-center gap-1.5 font-semibold text-ink">
            Cum să-ți spunem <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            <span className="sr-only">(obligatoriu)</span>
          </label>
          <div className={fieldShell(Boolean(errors.alias))}>
            <UserRound aria-hidden className="size-5 shrink-0 text-ink-muted" />
            <input
              ref={aliasRef}
              id="alias"
              autoComplete="given-name"
              maxLength={60}
              placeholder="ex. Andrei"
              value={value.alias}
              onChange={(e) => set("alias", e.target.value)}
              aria-required="true"
              aria-invalid={errors.alias ? true : undefined}
              aria-describedby={cn("alias-help", errors.alias && "alias-error")}
              className="w-full min-w-0 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-ink-muted/70"
            />
          </div>
          <p id="alias-help" className="text-sm text-ink-muted">
            Un prenume sau un pseudonim — nu avem nevoie de numele complet.
          </p>
          {errors.alias && (
            <p id="alias-error" className="text-sm font-medium text-danger">
              {errors.alias}
            </p>
          )}
        </div>

        {subscriber ? (
          <p className="flex items-center gap-2 rounded-[var(--radius-control)] bg-surface-muted px-3 py-2.5 text-sm text-ink" data-testid="onboarding-subscribed">
            <Mail aria-hidden className="size-4 text-primary" />
            Ești abonat la digest cu <strong>{maskEmail(subscriber.email)}</strong> (mod demo).
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="email" className="font-semibold text-ink">
                Adresă de e-mail
              </label>
              <span className="text-xs font-semibold text-ink-muted">Opțional</span>
            </div>
            <div className={fieldShell(Boolean(errors.email))}>
              <Mail aria-hidden className="size-5 shrink-0 text-ink-muted" />
              <input
                ref={emailRef}
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="andrei@exemplu.ro"
                value={value.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={cn("email-help", errors.email && "email-error")}
                className="w-full min-w-0 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-ink-muted/70"
              />
            </div>
            <p id="email-help" className="text-sm text-ink-muted">
              Doar dacă vrei digestul săptămânal cu noutăți economice. Poți continua și fără.
            </p>
            {errors.email && (
              <p id="email-error" className="text-sm font-medium text-danger">
                {errors.email}
              </p>
            )}
            {showConsent && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-start gap-3">
                  <input
                    ref={consentRef}
                    id="consent"
                    type="checkbox"
                    checked={value.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                    aria-invalid={errors.consent ? true : undefined}
                    aria-describedby={errors.consent ? "consent-error" : undefined}
                    className="mt-1 size-5 shrink-0 accent-[var(--color-primary)]"
                  />
                  <label htmlFor="consent" className="text-sm leading-relaxed text-ink">
                    {CONSENT_TEXT}{" "}
                    <Link href="/confidentialitate" className="font-semibold text-primary underline underline-offset-2">
                      Nota de confidențialitate
                    </Link>
                  </label>
                </div>
                {errors.consent && (
                  <p id="consent-error" className="pl-8 text-sm font-medium text-danger">
                    {errors.consent}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <fieldset className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <legend className="font-semibold text-ink">Interval de vârstă</legend>
            <span className="text-xs font-semibold text-ink-muted">Opțional</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 rounded-[var(--radius-control)] border border-border bg-bg p-1.5">
            {AGE_RANGES.map((r) => {
              const on = value.ageRange === r;
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set("ageRange", on ? null : r)}
                  className={cn(
                    "tabular flex min-h-11 items-center justify-center gap-1.5 rounded-[8px] text-sm transition-colors",
                    on ? "bg-surface font-semibold text-primary shadow-[var(--shadow-card)]" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {AGE_LABELS[r]}
                  {on && <span aria-hidden className="size-1.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-ink-muted">Apasă din nou pe interval ca să renunți la selecție.</p>
        </fieldset>

        <p className="flex gap-2.5 rounded-[var(--radius-control)] border border-border bg-bg px-4 py-3 text-sm text-ink-muted">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          Datele rămân doar în acest browser. Nu cerem CNP, IBAN sau date de card, iar adresa de e-mail o folosim doar
          pentru digest, dacă îți dai acordul.
        </p>

        <Button type="submit" onMouseDown={(e) => e.preventDefault()} className="min-h-12 w-full text-base">
          Continuă spre datele financiare <ArrowRight aria-hidden className="size-4" />
        </Button>
      </Card>
    </form>
  );
}
