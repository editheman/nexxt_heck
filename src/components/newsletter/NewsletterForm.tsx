"use client";

import { CheckCircle2, FlaskConical } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { CONSENT_TEXT } from "@/content/consent";
import { maskEmail, type ConsentSource } from "@/lib/newsletter";
import { newsletter } from "@/lib/useNewsletter";

export function DemoModeNote() {
  return (
    <p className="flex items-start gap-2 rounded-[var(--radius-control)] bg-surface-muted px-3 py-2 text-xs text-ink-muted">
      <FlaskConical aria-hidden className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <span>
        <strong className="text-ink">Mod demo:</strong> nu este conectat niciun serviciu de e-mail. Nu trimitem e-mailuri,
        iar adresa și acordul se salvează doar în acest browser.
      </span>
    </p>
  );
}

export function SubscribedNote({ email }: { email: string }) {
  return (
    <div role="status" className="flex gap-3 rounded-[var(--radius-control)] bg-success-soft p-4 text-sm">
      <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
      <div className="space-y-1">
        <p className="font-semibold text-ink">Abonare înregistrată (mod demo)</p>
        <p className="text-ink">
          Am salvat adresa <strong>{maskEmail(email)}</strong> și acordul tău doar în acest browser. Nu a fost trimis
          niciun e-mail și nu există o listă de abonați pe un server.{" "}
          <Link href="/dezabonare" className="font-semibold text-primary underline underline-offset-2">
            Dezabonare
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Email + separate, unchecked marketing consent. Nothing is stored unless consent is explicitly given. */
export function NewsletterForm({
  source,
  onSubscribed,
  secondary,
}: {
  source: ConsentSource;
  onSubscribed?: (email: string) => void;
  secondary?: React.ReactNode;
}) {
  const id = useId();
  const emailId = `${id}-email`;
  const consentId = `${id}-consent`;
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; consent?: string }>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = newsletter.subscribe(email, consent, source);
    if (!r.ok) {
      setErrors(r.errors);
      (r.errors.email ? emailRef : consentRef).current?.focus();
      return;
    }
    setErrors({});
    onSubscribed?.(r.subscriber.email);
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4" aria-label="Abonare la digestul săptămânal">
      <div className="space-y-1.5">
        <label htmlFor={emailId} className="text-sm font-semibold text-ink">
          Adresa de e-mail
        </label>
        <input
          ref={emailRef}
          id={emailId}
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((x) => ({ ...x, email: undefined }));
          }}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          className={cn(
            "min-h-11 w-full rounded-[var(--radius-control)] border bg-surface px-3 py-2 text-base",
            errors.email ? "border-danger" : "border-border-strong",
          )}
        />
        {errors.email && (
          <p id={`${emailId}-error`} className="text-sm font-medium text-danger">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-3">
          <input
            ref={consentRef}
            id={consentId}
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (errors.consent) setErrors((x) => ({ ...x, consent: undefined }));
            }}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={cn(`${consentId}-privacy`, errors.consent && `${consentId}-error`)}
            className="mt-1 size-5 shrink-0 accent-[var(--color-primary)]"
          />
          <label htmlFor={consentId} className="text-sm leading-relaxed text-ink">
            {CONSENT_TEXT}
          </label>
        </div>
        <p id={`${consentId}-privacy`} className="pl-8 text-xs text-ink-muted">
          Acordul este opțional și separat de adresa de e-mail. Detalii în{" "}
          <Link href="/confidentialitate" className="font-semibold text-primary underline underline-offset-2">
            nota de confidențialitate
          </Link>
          .
        </p>
        {errors.consent && (
          <p id={`${consentId}-error`} className="pl-8 text-sm font-medium text-danger">
            {errors.consent}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button type="submit">Abonează-mă</Button>
        {secondary}
      </div>
    </form>
  );
}
