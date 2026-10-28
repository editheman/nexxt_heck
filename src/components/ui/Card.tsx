import type { ComponentProps } from "react";
import { cn } from "./cn";

const bars = {
  primary: "before:bg-primary",
  accent: "before:bg-accent",
  danger: "before:bg-danger",
  gradient: "before:bar-gradient",
} as const;

export function Card({ className, bar, ...props }: ComponentProps<"div"> & { bar?: keyof typeof bars }) {
  return (
    <div
      className={cn(
        "relative rounded-[var(--radius-card)] border border-border/70 bg-surface p-6 shadow-[var(--shadow-card)]",
        bar && "overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-1",
        bar && bars[bar],
        className,
      )}
      {...props}
    />
  );
}
