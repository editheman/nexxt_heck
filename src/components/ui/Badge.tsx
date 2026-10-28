import { cn } from "./cn";

export type BadgeKind = "user" | "assumption" | "estimate" | "fictional";

const styles: Record<BadgeKind, { label: string; className: string }> = {
  user: { label: "Datele tale", className: "bg-surface-muted text-ink border-transparent" },
  assumption: { label: "Ipoteză", className: "bg-primary-soft text-assumption border-transparent" },
  estimate: { label: "Estimare", className: "bg-accent-soft text-accent border-transparent" },
  fictional: { label: "Exemplu fictiv", className: "bg-surface text-ink-muted border-border-strong border-dashed" },
};

/** Data-provenance label. Always text, never color alone. */
export function Badge({ kind, children, className }: { kind: BadgeKind; children?: React.ReactNode; className?: string }) {
  const s = styles[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.72rem] font-medium whitespace-nowrap",
        s.className,
        className,
      )}
    >
      {children ?? s.label}
    </span>
  );
}

const tagTones = {
  indigo: "bg-primary-soft text-primary",
  rose: "bg-danger-soft text-danger",
  mint: "bg-accent-soft text-accent",
  slate: "bg-surface-muted text-ink",
} as const;

export type TagTone = keyof typeof tagTones;

/** Topic pill (category labels on cards). */
export function Tag({ tone = "indigo", children }: { tone?: TagTone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[0.72rem] font-medium", tagTones[tone])}>
      {children}
    </span>
  );
}
