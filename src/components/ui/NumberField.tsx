"use client";

import { useState } from "react";
import { formatNumberInput, parseRoNumber } from "@/lib/format";
import { cn } from "./cn";

type Props = {
  id: string;
  label: string;
  value: number | null;
  /** Called with the parsed number, or null when the text is empty/unparseable. */
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  suffix?: string;
  helper?: string;
  error?: string;
  badge?: React.ReactNode;
  className?: string;
};

/**
 * Text input that accepts Romanian number formats ("1.000", "5,5").
 * Keeps the user's raw text while typing; normalises it on blur.
 */
export function NumberField({ id, label, value, onChange, onBlur, suffix, helper, error, badge, className }: Props) {
  const [text, setText] = useState(() => (value === null ? "" : formatNumberInput(value)));
  const [lastValue, setLastValue] = useState(value);
  const [focused, setFocused] = useState(false);

  // Sync from outside (slider, preset) when not being edited.
  if (!focused && value !== lastValue) {
    setLastValue(value);
    setText(value === null ? "" : formatNumberInput(value));
  }

  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={id} className="font-semibold text-ink">
          {label}
        </label>
        {badge}
      </div>
      {helper && (
        <p id={helperId} className="text-sm text-ink-muted">
          {helper}
        </p>
      )}
      <div
        className={cn(
          "flex min-h-11 items-center rounded-[var(--radius-control)] border bg-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
          error ? "border-danger" : "border-border-strong",
        )}
      >
        <input
          id={id}
          name={id}
          inputMode="decimal"
          autoComplete="off"
          value={text}
          aria-invalid={error ? true : undefined}
          aria-describedby={[helperId, errorId].filter(Boolean).join(" ") || undefined}
          onFocus={() => setFocused(true)}
          onChange={(e) => {
            setText(e.target.value);
            const parsed = parseRoNumber(e.target.value);
            setLastValue(parsed);
            onChange(parsed);
          }}
          onBlur={() => {
            setFocused(false);
            const parsed = parseRoNumber(text);
            if (parsed !== null) setText(formatNumberInput(parsed));
            onBlur?.();
          }}
          className="tabular w-full min-w-0 bg-transparent px-3 py-2 text-base text-ink outline-none"
        />
        {suffix && (
          <span aria-hidden className="pr-3 text-ink-muted">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
