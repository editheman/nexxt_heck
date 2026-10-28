import { cn } from "./cn";

export type BadgeKind = "user" | "official" | "assumption" | "estimate" | "fictional";

const styles: Record<BadgeKind, { label: string; className: string }> = {
  user: { label: "Datele tale", className: "bg-surface-muted text-primary border-transparent" },
  official: { label: "Date oficiale", className: "bg-surface text-primary border-primary/40" },
  assumption: { label: "Ipoteză", className: "bg-assumption-soft text-assumption border-transparent" },
  estimate: { label: "Estimare", className: "bg-accent-soft text-accent border-transparent" },
  fictional: { label: "Exemplu fictiv", className: "bg-surface text-ink-muted border-border-strong border-dashed" },
};

/** Data-provenance label. Always text, never color alone. */
export function Badge({ kind, children, className }: { kind: BadgeKind; children?: React.ReactNode; className?: string }) {
  const s = styles[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap",
        s.className,
        className,
      )}
    >
      {children ?? s.label}
    </span>
  );
}
