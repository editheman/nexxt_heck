"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { Logo } from "./Logo";
import { useOnboardingDone } from "@/components/journey/Onboarding";
import { resumeHref } from "@/lib/resume";
import { useAuth } from "@/lib/useAuth";
import { useDemoState } from "@/lib/useDemoState";
import { AccountMenu } from "./AccountMenu";
import { NAV_ITEMS } from "./nav";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  const { done } = useOnboardingDone();
  const { account } = useAuth();
  const { state } = useDemoState();
  const primaryNav = NAV_ITEMS;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 font-bold text-ink">
          <Logo size={36} />
          <span className="text-[1.05rem] leading-tight tracking-tight">Protejează ce ai construit</span>
        </Link>

        {done && (
        <nav aria-label="Navigare principală" className="hidden lg:block">
          <ul className="flex items-center">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
                      active ? "text-primary" : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        )}

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {!done && (
            <Link
              href={account ? resumeHref(state) : "/profil"}
              className={buttonClass("primary", "hidden min-h-10 px-4 py-2 text-sm sm:inline-flex")}
            >
              {account ? "Continuă profilarea" : "Începe"}
            </Link>
          )}
          <AccountMenu />
          {done && (
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] text-ink hover:bg-surface-muted lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
              <span className="sr-only">{open ? "Închide meniul" : "Meniu"}</span>
            </button>
          )}
        </div>
      </div>

      {open && done && (
        <nav id="mobile-nav" aria-label="Navigare principală" className="border-t border-border bg-surface lg:hidden">
          <ul className="mx-auto max-w-[1120px] px-4 py-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center rounded-[var(--radius-control)] px-3 font-semibold",
                      active ? "bg-primary-soft text-primary" : "text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
