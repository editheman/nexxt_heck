"use client";

import { ArrowRight, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PasswordField } from "@/components/profile/PasswordField";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/components/ui/cn";
import { resumeHref } from "@/lib/resume";
import { auth, useAuth } from "@/lib/useAuth";
import { getDemoState } from "@/lib/useDemoState";

export function LoginForm() {
  const router = useRouter();
  const { account, hydrated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  if (!hydrated) return <PageSkeleton />;

  if (account && !justLoggedIn) {
    return (
      <Card className="space-y-4 text-center">
        <p className="text-lg text-ink">
          Ești conectat ca <strong>{account.username}</strong>.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/portal">Mergi în portal</ButtonLink>
          <Button
            variant="secondary"
            onClick={() => {
              auth.logout();
              router.push("/");
            }}
          >
            Deconectare
          </Button>
        </div>
      </Card>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (username.trim() === "" || password === "") {
      setError("Completează numele de utilizator și parola.");
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setBusy(true);
    setError(null);
    const ok = await auth.login(username, password);
    setBusy(false);
    if (!ok) {
      setPassword("");
      setError("Nume de utilizator sau parolă greșită.");
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    // The account's own state is loaded now; continue where this user left off.
    setJustLoggedIn(true);
    router.replace(resumeHref(getDemoState()));
  }

  if (justLoggedIn) return <PageSkeleton />;

  return (
    <form noValidate onSubmit={submit} aria-label="Intră în cont">
      <Card className="space-y-5 p-6 sm:p-8">
        <div aria-live="assertive">
          {error && (
            <p ref={errorRef} tabIndex={-1} role="alert" className="rounded-[var(--radius-control)] bg-danger-soft px-4 py-3 text-sm font-medium text-danger outline-none">
              {error}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="login-username" className="font-semibold text-ink">
            Nume de utilizator
          </label>
          <div
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-[var(--radius-control)] border border-border bg-bg px-3 focus-within:border-primary focus-within:bg-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
            )}
          >
            <UserRound aria-hidden className="size-5 shrink-0 text-ink-muted" />
            <input
              id="login-username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full min-w-0 bg-transparent py-2.5 text-base text-ink outline-none"
            />
          </div>
        </div>
        <PasswordField id="login-password" label="Parolă" autoComplete="current-password" value={password} onChange={setPassword} />
        <Button type="submit" aria-disabled={busy || undefined} className="min-h-12 w-full text-base">
          {busy ? "Se verifică…" : "Intră în cont"} {!busy && <ArrowRight aria-hidden className="size-4" />}
        </Button>
        <p className="text-center text-sm text-ink-muted">
          Nu ai cont?{" "}
          <Link href="/profil" className="font-semibold text-primary underline underline-offset-2">
            Creează unul
          </Link>
        </p>
        <p className="text-center text-xs text-ink-muted">
          Cont demo: conturile există doar în acest browser. Nu putem recupera parola — dacă o uiți, creează un cont nou.
        </p>
      </Card>
    </form>
  );
}
