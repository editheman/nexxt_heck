import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LATEST_DATA_YEAR, REALITY_WINDOWS, type RealityWindow } from "@/content/macro-ro";

/**
 * Choice of official history window. Inflation itself is fixed (read-only) data.
 * Labels show base year → latest year (e.g. 2020–2025 for 5 years), the same period the
 * result cards use; the yearly rates applied are those of the years after the base year.
 */
export function WindowPicker({ value, onChange }: { value: RealityWindow; onChange: (v: RealityWindow) => void }) {
  return (
    <Card className="p-5 sm:p-6">
      <fieldset className="space-y-3">
        <legend className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
          Perioada analizată <Badge kind="official">Date oficiale INS · BNR</Badge>
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {REALITY_WINDOWS.map((n) => (
            <label
              key={n}
              className="tabular inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--radius-control)] bg-primary-soft px-4 text-center text-sm font-semibold text-ink transition-colors hover:bg-surface-muted has-checked:bg-primary has-checked:text-on-primary has-checked:shadow-[0_6px_16px_rgb(79_70_229/0.25)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring"
            >
              <input
                type="radio"
                name="reality-window"
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="sr-only"
              />
              Ultimii {n} ani ({LATEST_DATA_YEAR - n}–{LATEST_DATA_YEAR})
            </label>
          ))}
        </div>
        <p className="text-sm text-ink-muted">
          Inflația nu se poate modifica aici: folosim ratele publicate de INS pentru fiecare an. Ipotezele despre viitor
          le alegi în simulator.
        </p>
      </fieldset>
    </Card>
  );
}
