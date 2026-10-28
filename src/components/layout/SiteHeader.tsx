"use client";

import { Menu, Shield, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
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
  const primaryNav = NAV_ITEMS.filter((i) => i.href !== "/progres");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 font-bold text-ink">
          <span className="flex size-8 items-center justify-center rounded-[9px] bg-primary text-on-primary">
            <Shield aria-hidden className="size-[18px]" />
          </span>
          <span className="text-[1.05rem] leading-tight tracking-tight">Protejează ce ai construit</span>
        </Link>

        <nav aria-label="Navigare principală" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-3 text-sm font-semibold transition-colors",
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

        <div className="ml-auto hidden items-center gap-3 md:flex">
          <Link href="/profil" className={buttonClass("primary", "min-h-10 px-4 py-2 text-sm")}>
            Începe
          </Link>
          <Link
            href="/progres"
            aria-current={isActive(pathname, "/progres") ? "page" : undefined}
            className="flex size-10 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-hover"
          >
            <UserRound aria-hidden className="size-[18px]" />
            <span className="sr-only">Progresul tău</span>
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] text-ink hover:bg-surface-muted md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
          <span className="sr-only">{open ? "Închide meniul" : "Meniu"}</span>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Navigare principală" className="border-t border-border bg-surface md:hidden">
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
