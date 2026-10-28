import { Badge } from "@/components/ui/Badge";
import type { MacroFact } from "@/lib/schemas/facts";

/**
 * Macro fun-facts strip. Content comes from the build-time, Zod-validated
 * `dynamic-facts.json`. It scrolls only when the user scrolls it (no
 * auto-motion), so it stays readable and needs no pause control.
 */
export function MacroTicker({ facts, generatedAt }: { facts: MacroFact[]; generatedAt: string }) {
  return (
    <section aria-labelledby="ticker-title" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="ticker-title" className="text-sm font-semibold tracking-wide text-ink-muted uppercase">
          Economia, pe scurt
        </h2>
        <Badge kind="official">Date oficiale INS · BNR</Badge>
      </div>
      <ul
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
        data-testid="macro-ticker"
        tabIndex={0}
        aria-label="Fapte macroeconomice (derulează orizontal)"
      >
        {facts.map((f) => (
          <li
            key={f.id}
            className="flex w-[min(80vw,300px)] shrink-0 snap-start flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-4"
          >
            <p className="text-xs font-semibold tracking-wide text-accent uppercase">{f.kicker}</p>
            <p className="text-sm text-ink">{f.text}</p>
            <p className="mt-auto text-xs text-ink-muted">
              Sursa:{" "}
              {f.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && ", "}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">
                    {s.label}
                  </a>
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-muted">
        Generat automat din serii oficiale, verificat la build ({new Date(generatedAt).toLocaleDateString("ro-RO")}).
      </p>
    </section>
  );
}
