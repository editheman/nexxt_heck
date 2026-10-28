"use client";

import { ArrowRight, Info, UserRound } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { validatePassword, validateUsername } from "@/lib/auth";
import { PasswordField } from "./PasswordField";
import { AGE_RANGES, type AgeRange } from "@/lib/storage";

export type Identity = {
  username: string;
  password: string;
  confirm: string;
  ageRange: AgeRange | null;
};
export type IdentityErrors = Partial<Record<"username" | "password" | "confirm", string>>;
type Errors = IdentityErrors;

const AGE_LABELS: Record<AgeRange, string> = { "20-25": "20–25 ani", "26-30": "26–30 ani", "31-35": "31–35 ani" };

/** `signup` validates the new account's credentials; `edit` (logged in) has only optional fields. */
export function validateIdentity(d: Identity, mode: "signup" | "edit"): Errors {
  const e: Errors = {};
  if (mode === "signup") {
    const u = validateUsername(d.username);
    if (u) e.username = u;
    const p = validatePassword(d.password);
    if (p) e.password = p;
    if (d.confirm !== d.password) e.confirm = "Parolele nu coincid.";
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
  mode,
}: {
  value: Identity;
  onChange: (v: Identity) => void;
  /** Resolves with errors the form cannot know upfront (e.g. username already taken). */
  onNext: () => Promise<Errors | null>;
  mode: "signup" | "edit";
}) {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const aliasRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const errors: Errors = submitted ? { ...serverErrors, ...validateIdentity(value, mode) } : {};
  const set = <K extends keyof Identity>(k: K, v: Identity[K]) => {
    if (k === "username") setServerErrors({});
    onChange({ ...value, [k]: v });
  };

  function focusFirst(errs: Errors) {
    const first = errs.username
      ? aliasRef
      : errs.password
        ? passwordRef
        : errs.confirm
          ? confirmRef
          : null;
    first?.current?.focus();
    return first !== null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setServerErrors({});
    if (focusFirst(validateIdentity(value, mode))) return;
    setBusy(true);
    const result = await onNext();
    setBusy(false);
    if (result) {
      setServerErrors(result);
      focusFirst(result);
    }
  }

  return (
    <form noValidate onSubmit={submit} aria-label="Pasul 1: cine ești">
      <Card className="space-y-5 p-5 sm:p-7 short:space-y-4 short:sm:p-6">
        {mode === "signup" ? (
          <>
            <div className="space-y-2">
              <label htmlFor="username" className="flex items-center gap-1.5 font-semibold text-ink">
                Nume de utilizator <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                <span className="sr-only">(obligatoriu)</span>
              </label>
              <div className={fieldShell(Boolean(errors.username))}>
                <UserRound aria-hidden className="size-5 shrink-0 text-ink-muted" />
                <input
                  ref={aliasRef}
                  id="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={40}
                  placeholder="ex. andrei.p"
                  value={value.username}
                  onChange={(e) => set("username", e.target.value)}
                  aria-required="true"
                  aria-invalid={errors.username ? true : undefined}
                  aria-describedby={cn("username-help", errors.username && "username-error")}
                  className="w-full min-w-0 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-ink-muted/70"
                />
              </div>
              <p id="username-help" className="text-sm text-ink-muted">
                Îl folosești la autentificare și așa îți spunem. Poate fi un pseudonim.
              </p>
              {errors.username && (
                <p id="username-error" className="text-sm font-medium text-danger">
                  {errors.username}
                </p>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <PasswordField
                ref={passwordRef}
                id="password"
                label="Parolă"
                autoComplete="new-password"
                helper="Minimum 8 caractere, cu o literă și o cifră."
                value={value.password}
                onChange={(v) => set("password", v)}
                error={errors.password}
              />
              <PasswordField
                ref={confirmRef}
                id="confirm"
                label="Confirmă parola"
                autoComplete="new-password"
                value={value.confirm}
                onChange={(v) => set("confirm", v)}
                error={errors.confirm}
              />
            </div>
          </>
        ) : (
          <p className="flex items-center gap-2 rounded-[var(--radius-control)] bg-surface-muted px-3 py-2.5 text-sm text-ink">
            <UserRound aria-hidden className="size-4 text-primary" /> Conectat ca <strong>{value.username}</strong>
          </p>
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
        </fieldset>

        <p className="flex gap-2.5 rounded-[var(--radius-control)] border border-border bg-bg px-4 py-3 text-sm text-ink-muted">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          {mode === "signup"
            ? "Cont demo: datele rămân doar în acest browser, iar parola nu se salvează — păstrăm doar o amprentă criptografică (hash). Nu cerem CNP, IBAN sau date de card."
            : "Datele rămân doar în acest browser. Nu cerem CNP, IBAN, date de card sau adresă de e-mail."}
        </p>

        <Button type="submit" onMouseDown={(e) => e.preventDefault()} aria-disabled={busy || undefined} className="min-h-12 w-full text-base">
          {busy ? "Se creează contul…" : mode === "signup" ? "Creează contul și continuă" : "Continuă spre datele financiare"}
          {!busy && <ArrowRight aria-hidden className="size-4" />}
        </Button>
        {mode === "signup" && (
          <p className="text-center text-sm text-ink-muted">
            Ai deja cont?{" "}
            <Link href="/intra" className="font-semibold text-primary underline underline-offset-2">
              Intră în cont
            </Link>
          </p>
        )}
      </Card>
    </form>
  );
}
