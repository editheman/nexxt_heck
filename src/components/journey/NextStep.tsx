import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function NextStep({ href, label, hint }: { href: string; label: string; hint?: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary"
    >
      <span className="space-y-1">
        <span className="block text-sm font-semibold tracking-wide text-accent uppercase">Pasul următor</span>
        <span className="block font-heading text-lg font-semibold text-primary">{label}</span>
        {hint && <span className="block text-sm text-ink-muted">{hint}</span>}
      </span>
      <ArrowRight aria-hidden className="size-6 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export function PageHeader({ step, title, lead }: { step?: string; title: string; lead?: React.ReactNode }) {
  return (
    <header className="space-y-3">
      {step && <p className="text-sm font-semibold tracking-wide text-accent uppercase">{step}</p>}
      <h1 className="text-3xl font-semibold text-primary sm:text-4xl">{title}</h1>
      {lead && <p className="max-w-[68ch] text-lg text-ink-muted">{lead}</p>}
    </header>
  );
}
