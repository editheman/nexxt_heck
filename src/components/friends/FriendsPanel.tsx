"use client";

import { EyeOff, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";
import { ACCOUNTS_KEY, accountStateKey, parseAccounts } from "@/lib/auth";
import { COMPARE_YEARS, friendRows, type FriendRow, type Trend } from "@/lib/friends";
import { parseState } from "@/lib/storage";
import { useAuth } from "@/lib/useAuth";
import { useDemoState } from "@/lib/useDemoState";

const TREND_STYLE: Record<Trend, string> = {
  Crește: "bg-accent text-on-primary",
  Păstrează: "bg-accent-soft text-accent",
  Pierde: "bg-danger-soft text-danger",
};

const pct = (v: number) => `${new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 }).format(v)}%`;

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Right-hand panel on every app page (not the home page) while logged in. */
export function FriendsPanel() {
  const { account, hydrated } = useAuth();
  const { state } = useDemoState();
  // Other accounts change only in other tabs; re-read on the cross-tab `storage` event.
  const [, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);

  if (!hydrated || !account) return null;
  const accounts = parseAccounts(readStorage(ACCOUNTS_KEY));
  const rows = friendRows(
    accounts.some((a) => a.id === account.id) ? accounts : [account, ...accounts],
    account.id,
    (id) => (id === account.id ? state : parseState(readStorage(accountStateKey(id, "v1")))),
  );
  const friends = rows.filter((r) => !r.isMe);

  return (
    <aside
      aria-labelledby="prieteni-titlu"
      className="mx-auto mt-10 mb-20 max-w-[1120px] xl:mx-0 xl:mt-0 xl:mb-0 xl:w-[260px] xl:shrink-0"
      data-testid="friends-panel"
    >
      <div className="space-y-4 rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)] xl:sticky xl:top-20">
        <div className="space-y-1">
          <h2 id="prieteni-titlu" className="flex items-center gap-2 text-base font-semibold text-ink">
            <Users aria-hidden className="size-4 text-primary" /> Prieteni
          </h2>
          <p className="text-xs text-ink-muted">
            Cât din puterea de cumpărare și-ar păstra economiile peste {COMPARE_YEARS} ani. Doar procente — niciodată sume.
          </p>
        </div>

        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
          {rows.map((r) => (
            <FriendCard key={r.id} row={r} />
          ))}
        </ul>

        {friends.length === 0 && (
          <p className="text-xs text-ink-muted" data-testid="friends-empty">
            Încă nu ai prieteni. Orice cont nou creat în aplicație apare aici automat.
          </p>
        )}

        <p className="text-[0.6875rem] leading-relaxed text-ink-muted">
          Estimare cu randamentul din profilul fiecăruia și inflația presupusă în simulator: valoarea economiilor în lei de azi
          față de valoarea de azi a sumelor depuse. Ipoteze, nu prognoze.
        </p>
      </div>
    </aside>
  );
}

function FriendCard({ row: r }: { row: FriendRow }) {
  const visible = r.keptPct !== null;
  return (
    <li
      className={cn("space-y-2 rounded-[var(--radius-control)] border p-3", r.isMe ? "border-primary/40 bg-primary-soft/40" : "border-border bg-bg")}
      data-testid={r.isMe ? "friend-me" : `friend-${r.username}`}
    >
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xs font-bold text-primary">
          {r.initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">
            {r.username}
            {r.isMe && <span className="font-normal text-ink-muted"> (tu)</span>}
          </span>
        </span>
        {visible && r.trend && (
          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold", TREND_STYLE[r.trend])}>{r.trend}</span>
        )}
      </div>
      {visible ? (
        <>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-muted">Putere de cumpărare păstrată</span>
            <span className="tabular font-semibold text-ink" data-testid="kept-pct">{pct(r.keptPct!)}</span>
          </div>
          <div
            role="progressbar"
            aria-label={`Putere de cumpărare păstrată de ${r.username}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(Math.min(100, r.keptPct!))}
            aria-valuetext={pct(r.keptPct!)}
            className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
          >
            <div className={cn("h-full rounded-full", r.keptPct! >= 99.5 ? "bg-accent" : "bg-danger")} style={{ width: `${Math.min(100, r.keptPct!)}%` }} />
          </div>
        </>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-ink-muted">
          <EyeOff aria-hidden className="size-3.5" />
          {r.isMe ? "Completează profilul ca să-ți vezi procentul." : "Nu și-a completat încă profilul."}
        </p>
      )}
    </li>
  );
}
