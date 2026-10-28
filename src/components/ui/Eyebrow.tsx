import { cn } from "./cn";

/** Small mono uppercase section label, optionally with a dot or icon. */
export function Eyebrow({
  children,
  icon,
  dot,
  tone = "primary",
  className,
  center,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  dot?: boolean;
  tone?: "primary" | "accent" | "muted";
  className?: string;
  center?: boolean;
}) {
  const color = tone === "accent" ? "text-accent" : tone === "muted" ? "text-ink-muted" : "text-primary";
  return (
    <p className={cn("eyebrow flex items-center gap-2", center && "justify-center", color, className)}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {icon}
      <span>{children}</span>
    </p>
  );
}
