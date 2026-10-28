"use client";

import { ChartColumn, LayoutDashboard, ListChecks, LogIn, LogOut, UserPlus, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { auth, useAuth } from "@/lib/useAuth";

const item = "flex min-h-11 w-full items-center gap-2.5 rounded-[var(--radius-control)] px-3 text-left text-sm font-semibold text-ink hover:bg-surface-muted";

/** Header avatar: logged out → Intră în cont / Creează cont; logged in → Portalul meu / Deconectare. */
export function AccountMenu() {
  const { account, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const ref = useRef<HTMLDivElement>(null);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Browser extensions (e.g. one adding `jf-ext-button-ct`) tag this button before hydration;
          ignore attribute differences on this element only. */}
      <button
        type="button"
        suppressHydrationWarning
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex size-10 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-hover"
      >
        <UserRound aria-hidden className="size-[18px]" />
        <span className="sr-only">{hydrated && account ? `Contul tău (${account.username})` : "Cont"}</span>
      </button>
      {open && (
        <div id="account-menu" className="absolute right-0 z-50 mt-2 w-60 rounded-[var(--radius-card)] border border-border bg-surface p-2 shadow-[var(--shadow-raised)]">
          {account ? (
            <>
              <p className="px-3 py-2 text-xs text-ink-muted">
                Conectat ca <strong className="text-ink">{account.username}</strong>
              </p>
              <Link href="/portal" className={item}>
                <LayoutDashboard aria-hidden className="size-4 text-primary" /> Portalul meu
              </Link>
              <Link href="/metode" className={item}>
                <ListChecks aria-hidden className="size-4 text-primary" /> Metodele mele
              </Link>
              <Link href="/progres" className={item}>
                <ChartColumn aria-hidden className="size-4 text-primary" /> Progres
              </Link>
              <button
                type="button"
                className={item}
                onClick={() => {
                  auth.logout();
                  setOpen(false);
                  router.push("/");
                }}
              >
                <LogOut aria-hidden className="size-4 text-primary" /> Deconectare
              </button>
            </>
          ) : (
            <>
              <Link href="/intra" className={item}>
                <LogIn aria-hidden className="size-4 text-primary" /> Intră în cont
              </Link>
              <Link href="/profil" className={item}>
                <UserPlus aria-hidden className="size-4 text-primary" /> Creează cont
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
