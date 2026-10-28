import { ExternalLink } from "lucide-react";
import type { Product } from "@/content/products";

/** The verified fact sheet of one category (shared by both product variants). */
export function ProductFacts({ product: p }: { product: Product }) {
  const rows: Array<[string, string]> = [
    ["Ce este", p.what],
    ["Risc", p.risk.text],
    ["Lichiditate", p.liquidity.text],
    ["Orizont", p.horizon],
    ["Protecție", p.protection],
    ["Costuri", p.costs],
    ["Impozitare", p.tax],
    ["De unde", p.where],
  ];
  return (
    <div className="space-y-4 text-sm">
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[9rem_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-semibold text-ink">{k}</dt>
            <dd className="text-ink-muted">{v}</dd>
          </div>
        ))}
      </dl>
      <div>
        <p className="font-semibold text-ink">Întreabă sau verifică înainte</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-ink-muted">
          {p.checks.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {p.sources.map((s) => (
          <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2">
            {s.name} <ExternalLink aria-hidden className="size-3" />
          </a>
        ))}
      </p>
    </div>
  );
}

export function LevelMeter({ label, level, testId }: { label: string; level: number; testId?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-ink-muted" data-testid={testId}>
      {label}
      <span aria-hidden className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= level ? "h-2 w-3 rounded-sm bg-primary" : "h-2 w-3 rounded-sm bg-surface-muted"} />
        ))}
      </span>
      <span className="sr-only">{level} din 5</span>
    </span>
  );
}
