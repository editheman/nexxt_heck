import type { ComponentProps } from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]", className)}
      {...props}
    />
  );
}
