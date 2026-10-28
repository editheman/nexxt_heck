import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./cn";

type Tone = "info" | "assumption" | "success" | "danger";

const tones: Record<Tone, { icon: typeof Info; className: string; iconClass: string }> = {
  info: { icon: Info, className: "bg-surface-muted", iconClass: "text-primary" },
  assumption: { icon: AlertTriangle, className: "bg-assumption-soft", iconClass: "text-assumption" },
  success: { icon: CheckCircle2, className: "bg-success-soft", iconClass: "text-success" },
  danger: { icon: ShieldAlert, className: "bg-danger-soft", iconClass: "text-danger" },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
  role,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: "alert" | "status";
}) {
  const t = tones[tone];
  const Icon = t.icon;
  return (
    <div role={role} className={cn("flex gap-3 rounded-[var(--radius-control)] p-4", t.className, className)}>
      <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", t.iconClass)} />
      <div className="min-w-0 space-y-1 text-sm leading-relaxed">
        {title && <p className="font-semibold text-ink">{title}</p>}
        {children && <div className="text-ink">{children}</div>}
      </div>
    </div>
  );
}
