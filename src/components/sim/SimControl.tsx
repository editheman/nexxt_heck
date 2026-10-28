"use client";

import { NumberField } from "@/components/ui/NumberField";

type Props = {
  id: string;
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
  error?: string;
  badge?: React.ReactNode;
  helper?: string;
};

/** Numeric input paired with a slider; both stay in sync and are keyboard operable. */
export function SimControl({ id, label, value, onChange, min, max, step, suffix, error, badge, helper }: Props) {
  const sliderValue = value === null ? min : Math.min(max, Math.max(min, value));
  return (
    <div className="space-y-2">
      <NumberField id={id} label={label} value={value} onChange={onChange} suffix={suffix} error={error} badge={badge} helper={helper} />
      <input
        type="range"
        aria-label={`${label} (glisor)`}
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full accent-[var(--color-primary)]"
      />
    </div>
  );
}
