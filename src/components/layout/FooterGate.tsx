"use client";

import { usePathname } from "next/navigation";

/** The home page is a single screen with its own compact disclaimer, so the full footer is hidden there. */
export function FooterGate({ children }: { children: React.ReactNode }) {
  return usePathname() === "/" ? null : <>{children}</>;
}
