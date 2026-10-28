"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { forwardRef, useState } from "react";
import { cn } from "@/components/ui/cn";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: "new-password" | "current-password";
  error?: string;
  helper?: string;
};

/** Password input with a show/hide toggle. The toggle never submits the form. */
export const PasswordField = forwardRef<HTMLInputElement, Props>(function PasswordField(
  { id, label, value, onChange, autoComplete, error, helper },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const describedBy = cn(helper && `${id}-help`, error && `${id}-error`) || undefined;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="font-semibold text-ink">
        {label}
      </label>
      <div
        className={cn(
          "flex min-h-12 items-center gap-3 rounded-[var(--radius-control)] border bg-bg pl-3 transition-colors focus-within:border-primary focus-within:bg-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
          error ? "border-danger" : "border-border",
        )}
      >
        <Lock aria-hidden className="size-5 shrink-0 text-ink-muted" />
        <input
          ref={ref}
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="w-full min-w-0 bg-transparent py-2.5 text-base text-ink outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-controls={id}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-ink-muted hover:text-ink"
        >
          {visible ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
          <span className="sr-only">{visible ? "Ascunde parola" : "Arată parola"}</span>
        </button>
      </div>
      {helper && (
        <p id={`${id}-help`} className="text-sm text-ink-muted">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
