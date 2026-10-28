import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function NextStep({ href, label, hint }: { href: string; label: string; hint?: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary"
    >
      <span className="space-y-1">
        <Eyebrow dot>Pasul următor</Eyebrow>
        <span className="block text-lg font-semibold text-ink">{label}</span>
        {hint && <span className="block text-sm text-ink-muted">{hint}</span>}
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition-transform group-hover:translate-x-1">
        <ArrowRight aria-hidden className="size-5" />
      </span>
    </Link>
  );
}

export function PageHeader({ step, title, lead }: { step?: React.ReactNode; title: string; lead?: React.ReactNode }) {
  return (
    <header className="space-y-3">
      {typeof step === "string" ? <Eyebrow dot>{step}</Eyebrow> : step}
      <h1 className="text-3xl text-ink sm:text-[2.6rem]">{title}</h1>
      {lead && <p className="max-w-[68ch] text-lg text-ink-muted">{lead}</p>}
    </header>
  );
}
