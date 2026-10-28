"use client";

import { usePathname } from "next/navigation";

/** Pages that are focused, single-task screens: no footer. */
const NO_FOOTER = new Set(["/", "/profil"]);

export function FooterGate({ children }: { children: React.ReactNode }) {
  return NO_FOOTER.has(usePathname()) ? null : <>{children}</>;
}
