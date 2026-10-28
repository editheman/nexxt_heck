"use client";

import { AlertTriangle, ChartPie } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/components/ui/cn";
import { summarize } from "@/lib/finance";
import { formatLei, formatPct, formatYears } from "@/lib/format";

const AMOUNTS = [10000, 25000, 50000];
const HORIZONS = [3, 5, 10];
const INFLATION = { min: 1, max: 12, step: 0.5, initial: 5 };

function ChoiceGroup<T extends number>({
  legend,
  options,
  value,
  onChange,
  format,
}: {
  legend: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  format: (v: T) => string;
}) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-sm font-semibold text-ink">{legend}</legend>
      <div className="grid grid-cols-3 gap-2.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={o === value}
            onClick={() => onChange(o)}
            className={cn(
              "tabular min-h-11 rounded-[var(--radius-control)] px-2 text-sm font-semibold transition-colors",
              o === value ? "bg-primary text-on-primary shadow-[0_6px_16px_rgb(79_70_229/0.25)]" : "bg-primary-soft text-ink hover:bg-surface-muted",
            )}
          >
            {format(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Landing-page calculator: money kept without interest vs. its purchasing power under an assumed inflation rate. */
export function PerspectiveCalculator() {
  const [amount, setAmount] = useState(AMOUNTS[0]);
  const [years, setYears] = useState(HORIZONS[1]);
  const [inflation, setInflation] = useState(INFLATION.initial);

  const s = summarize({ principal: amount, monthly: 0, nominalPct: 0, inflationPct: inflation, years });
  const keptPct = (s.real / s.nominal) * 100;
  const loss = s.nominal - s.real;

  return (
    <Card bar="gradient" className="grid gap-8 p-6 shadow-[var(--shadow-raised)] sm:p-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-7 self-center">
        <ChoiceGroup legend="1. Alege o sumă economisită" options={AMOUNTS} value={amount} onChange={setAmount} format={(v) => formatLei(v)} />
        <ChoiceGroup legend="2. Orizontul de timp (banii stau fără dobândă)" options={HORIZONS} value={years} onChange={setYears} format={formatYears} />
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="home-inflation" className="text-sm font-semibold text-ink">
              3. Inflația anuală presupusă
            </label>
            <span className="tabular rounded-md bg-primary-soft px-2 py-0.5 font-mono text-xs font-medium text-primary">
              {formatPct(inflation)} / an
            </span>
          </div>
          <input
            id="home-inflation"
            type="range"
            min={INFLATION.min}
            max={INFLATION.max}
            step={INFLATION.step}
            value={inflation}
            onChange={(e) => setInflation(Number(e.target.value))}
            aria-valuetext={`${formatPct(inflation)} pe an`}
            className="h-11 w-full accent-[var(--color-primary)]"
          />
          <div className="flex justify-between font-mono text-xs text-ink-muted">
            <span>{formatPct(INFLATION.min)}</span>
            <span>{formatPct(INFLATION.max)}</span>
          </div>
          <p className="text-xs text-ink-muted">Valoare aleasă de tine pentru exercițiu — nu este rata oficială sau o prognoză.</p>
        </div>
      </div>

      <div className="space-y-6 rounded-[var(--radius-card)] border border-border bg-surface p-6" aria-live="polite">
        <div className="flex items-center justify-between">
          <Eyebrow tone="muted">Comparație putere de cumpărare</Eyebrow>
          <ChartPie aria-hidden className="size-5 text-primary" />
        </div>

        <dl className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <dt>
              <span className="block text-sm font-semibold text-ink">Valoare pe hârtie (nominală)</span>
              <span className="block text-sm text-ink-muted">Banii tăi în cont, peste {formatYears(years)}</span>
            </dt>
            <dd className="tabular text-right text-2xl font-bold whitespace-nowrap text-ink sm:text-3xl" data-testid="home-nominal">{formatLei(s.nominal)}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt>
              <span className="block text-sm font-semibold text-accent">Putere de cumpărare estimată</span>
              <span className="block text-sm text-ink-muted">În lei de azi</span>
            </dt>
            <dd className="tabular text-right text-2xl font-bold whitespace-nowrap text-accent sm:text-3xl" data-testid="home-real">{formatLei(s.real)}</dd>
          </div>
        </dl>

        <div className="space-y-2">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-danger-soft" aria-hidden>
            <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${keptPct}%` }} />
          </div>
          <div className="tabular flex justify-between font-mono text-xs">
            <span className="text-accent">{formatPct(keptPct)} păstrat</span>
            <span className="text-danger">{formatPct(100 - keptPct)} erodat de prețuri</span>
          </div>
        </div>

        <div className="flex gap-3 rounded-[var(--radius-control)] bg-danger-soft p-4">
          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
          <p className="text-sm text-ink">
            <span className="block font-semibold">Efectul tăcut al scumpirilor</span>
            Sub această ipoteză, puterea de cumpărare ar scădea cu aproximativ{" "}
            <strong className="tabular">{formatLei(loss)}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge kind="assumption" />
          <Badge kind="estimate" />
        </div>
        <p className="text-center font-mono text-[0.7rem] leading-relaxed text-ink-muted">
          Simulare ilustrativă: valoare nominală / (1 + inflație)ⁿ, cu dobândă 0%. Nu este o prognoză și nici o recomandare
          de investiții.
        </p>
      </div>
    </Card>
  );
}
