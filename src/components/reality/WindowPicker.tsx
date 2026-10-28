import { Badge } from "@/components/ui/Badge";
import { LATEST_DATA_YEAR, REALITY_WINDOWS, type RealityWindow } from "@/content/macro-ro";

/** Choice of official history window. Inflation itself is fixed (read-only) data. */
export function WindowPicker({ value, onChange }: { value: RealityWindow; onChange: (v: RealityWindow) => void }) {
  return (
    <fieldset className="space-y-3 rounded-[var(--radius-card)] border border-border bg-surface p-5">
      <legend className="flex flex-wrap items-center gap-2 font-semibold text-ink">
        Perioada analizată <Badge kind="official">Date oficiale INS · BNR</Badge>
      </legend>
      <div className="flex flex-wrap gap-2">
        {REALITY_WINDOWS.map((n) => (
          <label
            key={n}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-[var(--radius-control)] border border-border-strong bg-surface px-4 text-sm font-semibold text-primary transition-colors hover:border-primary has-checked:border-primary has-checked:bg-primary has-checked:text-on-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring"
          >
            <input
              type="radio"
              name="reality-window"
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="sr-only"
            />
            Ultimii {n} ani ({LATEST_DATA_YEAR - n + 1}–{LATEST_DATA_YEAR})
          </label>
        ))}
      </div>
      <p className="text-sm text-ink-muted">
        Inflația nu se poate modifica aici: folosim ratele publicate de INS pentru fiecare an. Ipotezele despre viitor
        le alegi în simulator.
      </p>
    </fieldset>
  );
}
