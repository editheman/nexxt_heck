"use client";

import { Check, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { decodeFriendCode, encodeFriendCode, friendFromProgress } from "@/lib/friends";
import type { ProgressSummary } from "@/lib/progress";
import { ALIAS_MAX, isValidAlias, type DemoState } from "@/lib/storage";
import { actions } from "@/lib/useDemoState";

const inputClass = "min-h-11 w-full rounded-[var(--radius-control)] border bg-surface px-3 py-2";

/**
 * Opt-in, alias-based comparison of educational progress (CLAUDE.md §3.7).
 * Codes carry only the alias and completion counts — never any amount.
 */
export function FriendsCompare({ social, summary }: { social: DemoState["social"]; summary: ProgressSummary }) {
  return (
    <section aria-labelledby="prieteni" className="space-y-3">
      <h2 id="prieteni" className="text-xl font-semibold">
        Compară cu prietenii
      </h2>
      <p className="max-w-[68ch] text-ink-muted">
        Opțional. Folosești un alias, iar codul de partajare conține doar progresul educațional (procent, module,
        quiz-uri, scenarii). Economiile și venitul tău nu pleacă niciodată din acest browser.
      </p>
      {social.alias === null ? <OptIn /> : <Compare alias={social.alias} friends={social.friends} summary={summary} />}
    </section>
  );
}

function OptIn() {
  const [alias, setAlias] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const error = submitted && !isValidAlias(alias.trim()) ? `Alege un alias de 2–${ALIAS_MAX} caractere.` : undefined;
  return (
    <Card>
      <form
        noValidate
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (isValidAlias(alias.trim())) actions.setSocialAlias(alias.trim());
        }}
      >
        <div className="flex-1 space-y-1.5">
          <label htmlFor="social-alias" className="font-semibold">
            Aliasul tău
          </label>
          <p id="social-alias-helper" className="text-sm text-ink-muted">
            Un pseudonim, nu numele complet.
          </p>
          <input
            id="social-alias"
            value={alias}
            maxLength={ALIAS_MAX}
            autoComplete="off"
            onChange={(e) => setAlias(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={cn("social-alias-helper", error && "social-alias-error")}
            className={cn(inputClass, error ? "border-danger" : "border-border-strong")}
          />
          {error && (
            <p id="social-alias-error" className="text-sm font-medium text-danger">
              {error}
            </p>
          )}
        </div>
        <Button type="submit">Activează comparația</Button>
      </form>
    </Card>
  );
}

function Compare({ alias, friends, summary }: { alias: string; friends: DemoState["social"]["friends"]; summary: ProgressSummary }) {
  const me = friendFromProgress(alias, summary);
  const myCode = encodeFriendCode(me);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(myCode);
      setCopied(true);
    } catch {
      (document.getElementById("my-code") as HTMLInputElement | null)?.select();
      setFeedback({ tone: "danger", text: "Browserul n-a permis copierea automată. Codul e selectat: copiază-l manual." });
    }
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    const friend = decodeFriendCode(code);
    if (!friend) {
      setFeedback({ tone: "danger", text: "Codul nu este valid. Verifică să fie copiat întreg (începe cu „PCAC1.”)." });
      return;
    }
    actions.addFriend(friend);
    setCode("");
    setFeedback({ tone: "success", text: `${friend.alias} a fost adăugat(ă) în comparație.` });
  }

  const rows = [{ ...me, isMe: true }, ...friends.map((f) => ({ ...f, isMe: false }))].sort((a, b) => b.percent - a.percent);

  return (
    <Card className="space-y-6">
      <div className="space-y-1.5">
        <label htmlFor="my-code" className="font-semibold">
          Codul tău, {alias}
        </label>
        <p className="text-sm text-ink-muted">Trimite-l prietenilor. E o fotografie a progresului de acum.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="my-code" readOnly value={myCode} className={cn(inputClass, "tabular border-border-strong text-sm")} data-testid="my-friend-code" onFocus={(e) => e.target.select()} />
          <Button variant="secondary" onClick={copy}>
            {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
            {copied ? "Copiat" : "Copiază"}
          </Button>
        </div>
      </div>

      <form noValidate onSubmit={add} className="space-y-1.5">
        <label htmlFor="friend-code" className="font-semibold">
          Adaugă codul unui prieten
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="friend-code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" placeholder="PCAC1.…" className={cn(inputClass, "border-border-strong")} />
          <Button type="submit">Adaugă</Button>
        </div>
      </form>

      <div aria-live="polite">
        {feedback && (
          <Alert tone={feedback.tone} title={feedback.tone === "success" ? "Adăugat" : "Nu a mers"}>
            {feedback.text}
          </Alert>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm" data-testid="friends-table">
          <caption className="pb-2 text-left font-semibold">Clasament educațional</caption>
          <thead className="bg-surface-muted text-left">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">Alias</th>
              <th scope="col" className="px-3 py-2 font-semibold">Progres</th>
              <th scope="col" className="px-3 py-2 font-semibold">Module</th>
              <th scope="col" className="px-3 py-2 font-semibold">Quiz-uri trecute</th>
              <th scope="col" className="px-3 py-2 font-semibold">Scenarii</th>
              <th scope="col" className="px-3 py-2"><span className="sr-only">Acțiune</span></th>
            </tr>
          </thead>
          <tbody className="tabular">
            {rows.map((r) => (
              <tr key={(r.isMe ? "me:" : "f:") + r.alias} className={cn("border-t border-border", r.isMe && "bg-accent-soft")}>
                <th scope="row" className="px-3 py-2 text-left font-semibold">{r.isMe ? `${r.alias} (tu)` : r.alias}</th>
                <td className="px-3 py-2">{r.percent}%</td>
                <td className="px-3 py-2">{r.modulesRead}</td>
                <td className="px-3 py-2">{r.quizzesPassed}</td>
                <td className="px-3 py-2">{r.scamsDone}</td>
                <td className="px-3 py-2 text-right">
                  {!r.isMe && (
                    <Button variant="ghost" className="min-h-9 px-2 py-1 text-sm" onClick={() => actions.removeFriend(r.alias)} aria-label={`Elimină ${r.alias}`}>
                      <Trash2 aria-hidden className="size-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="secondary" onClick={() => actions.setSocialAlias(null)}>
        Dezactivează comparația
      </Button>
    </Card>
  );
}
