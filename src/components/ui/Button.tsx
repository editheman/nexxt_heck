import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] px-5 py-2.5 text-[0.95rem] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary shadow-[0_6px_16px_rgb(79_70_229/0.28)] hover:bg-primary-hover",
  secondary: "border border-border bg-surface text-ink shadow-[var(--shadow-card)] hover:border-border-strong",
  ghost: "text-primary hover:bg-surface-muted",
  danger: "bg-danger text-white hover:opacity-90",
};

export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
