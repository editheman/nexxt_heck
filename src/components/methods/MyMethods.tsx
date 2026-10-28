"use client";

import { ArrowRight, CheckCircle2, CircleDashed, History, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { GOAL_LABELS, PLACEMENT_LABELS } from "@/content/labels";
import { productById } from "@/content/products";
import { formatDateTime, formatLei, formatYears } from "@/lib/format";
import { currentGeneration, history, methodsOf, type Generation, type Method } from "@/lib/plans";
import { useAuth } from "@/lib/useAuth";
import { actions, useDemoState } from "@/lib/useDemoState";

export function MyMethods() {
  const { state, hydrated } = useDemoState();
  const { account } = useAuth();
  if (!hydrated) return <PageSkeleton />;

  if (!account) {
    return (
      <Card className="space-y-4 text-center">
        <p className="text-ink">Metodele tale se salvează în cont. Intră în cont sau creează unul.</p>
        <ButtonLink href="/intra">Intră în cont</ButtonLink>
      </Card>
    );
  }

  const current = currentGeneration(state.plans);
  if (!current) {
    return (
      <Card className="space-y-4 text-center" data-testid="methods-empty">
        <p className="text-ink">Încă nu ai generat recomandări. Alege de acolo metodele care te interesează — apar aici ca draft.</p>
        <ButtonLink href="/recomandari">Vezi recomandările</ButtonLink>
      </Card>
    );
  }

  const mine = methodsOf(state.plans, current.id);
  const drafts = mine.filter((m) => m.status === "draft");
  const used = mine.filter((m) => m.status === "confirmed");
  const past = history(state.plans);

  return (
    <div className="space-y-12">
      <section aria-labelledby="actuale" className="space-y-5" data-testid="methods-current">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <Eyebrow dot>Actuale</Eyebrow>
            <h2 id="actuale" className="text-2xl text-ink">Pentru profilul tău de acum</h2>
            <p className="text-sm text-ink-muted">
              {setSummary(current)} · recomandări generate pe {formatDateTime(current.createdAt)}
            </p>
            <SavingsLine snapshot={current.snapshot} testId="current-savings" label="Economii" />
          </div>
          <ButtonLink href="/recomandari" variant="secondary">
            Recomandările <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>

        {mine.length === 0 ? (
          <Card className="text-ink-muted">
            Nu ai ales încă nicio metodă din recomandările actuale.{" "}
            <Link href="/recomandari" className="font-semibold text-primary underline underline-offset-2">Alege din recomandări</Link>.
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <MethodList
              title="În draft — te interesează"
              empty="Nicio metodă în draft."
              testId="methods-drafts"
              methods={drafts}
              icon={<CircleDashed aria-hidden className="size-5 text-primary" />}
              render={(m) => (
                <>
                  <Button onClick={() => actions.confirmMethod(current.id, m.productId)} data-testid={`confirm-${m.productId}`}>
                    <CheckCircle2 aria-hidden className="size-4" /> Confirm că o folosesc
                  </Button>
                  <Button variant="ghost" onClick={() => actions.removeMethod(current.id, m.productId)} aria-label={`Scoate ${productById(m.productId).name}`}>
                    <Trash2 aria-hidden className="size-4" /> Scoate
                  </Button>
                </>
              )}
            />
            <MethodList
              title="Le folosesc"
              empty="Nicio metodă confirmată încă."
              testId="methods-used"
              methods={used}
              icon={<CheckCircle2 aria-hidden className="size-5 text-success" />}
              render={(m) => (
                <>
                  <span className="text-xs text-ink-muted">Confirmată pe {formatDateTime(m.confirmedAt!)}</span>
                  <Button variant="ghost" onClick={() => actions.unconfirmMethod(current.id, m.productId)}>
                    <RotateCcw aria-hidden className="size-4" /> Nu o mai folosesc
                  </Button>
                </>
              )}
            />
          </div>
        )}
      </section>

      <section aria-labelledby="istoric" className="space-y-4" data-testid="methods-history">
        <div className="space-y-1">
          <Eyebrow tone="muted" icon={<History aria-hidden className="size-3.5" />}>
            Istoric
          </Eyebrow>
          <h2 id="istoric" className="text-xl text-ink">Profilurile tale anterioare</h2>
          <p className="text-sm text-ink-muted">
            Când îți schimbi profilul și generezi recomandări noi, setul vechi și metodele alese din el rămân aici, de la cel mai nou la cel mai vechi.
          </p>
        </div>
        {past.length === 0 ? (
          <p className="text-sm text-ink-muted">Nu ai încă un istoric.</p>
        ) : (
          <ol className="space-y-4">
            {past.map((g) => (
              <li key={g.id}>
                <HistoryEntry generation={g} methods={methodsOf(state.plans, g.id)} nowSavings={state.profile?.savings ?? null} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function setSummary(g: Generation) {
  return `${GOAL_LABELS[g.snapshot.goal]} · orizont ${formatYears(g.snapshot.horizonYears)}`;
}

function MethodList({
  title, empty, methods, icon, render, testId,
}: {
  title: string; empty: string; methods: Method[]; icon: React.ReactNode; render: (m: Method) => React.ReactNode; testId: string;
}) {
  return (
    <Card className="space-y-4" data-testid={testId}>
      <h3 className="flex items-center gap-2 text-lg text-ink">{icon} {title} <span className="tabular text-ink-muted">({methods.length})</span></h3>
      {methods.length === 0 ? (
        <p className="text-sm text-ink-muted">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {methods.map((m) => {
            const p = productById(m.productId);
            return (
              <li key={m.productId} className="space-y-2 rounded-[var(--radius-control)] border border-border bg-bg p-4" data-testid={`method-${m.productId}`}>
                <p className="font-semibold text-ink">{p.name}</p>
                <p className="text-sm text-ink-muted">{p.short}</p>
                <div className="flex flex-wrap items-center gap-2">{render(m)}</div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/** What the user had saved when a set was generated (from the set's snapshot). */
function SavingsLine({ snapshot: s, nowSavings, testId, label = "Economii atunci" }: { snapshot: Generation["snapshot"]; nowSavings?: number | null; testId: string; label?: string }) {
  const diff = nowSavings == null ? null : nowSavings - s.savings;
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink" data-testid={testId}>
      <Badge kind="user">{label}</Badge>
      <span className="tabular font-semibold">{formatLei(s.savings)}</span>
      <span className="text-ink-muted">{PLACEMENT_LABELS[s.placement]}</span>
      {s.monthly > 0 && <span className="tabular text-ink-muted">+{formatLei(s.monthly)} pe lună</span>}
      {diff !== null && diff !== 0 && (
        <span className={diff > 0 ? "tabular text-success" : "tabular text-danger"}>
          Acum ai cu {formatLei(Math.abs(diff))} {diff > 0 ? "mai mult" : "mai puțin"}
        </span>
      )}
    </p>
  );
}

function HistoryEntry({ generation: g, methods, nowSavings }: { generation: Generation; methods: Method[]; nowSavings: number | null }) {
  return (
    <Card className="space-y-3 bg-surface/80" data-testid={`history-${g.id}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-ink">{setSummary(g)}</p>
        <p className="text-xs text-ink-muted">{formatDateTime(g.createdAt)} · {g.source === "ai" ? `AI (${g.model})` : "după reguli"}</p>
      </div>
      <SavingsLine snapshot={g.snapshot} nowSavings={nowSavings} testId={`history-savings-${g.id}`} />
      <ol className="flex flex-wrap gap-2">
        {g.items.map((it, i) => {
          const m = methods.find((x) => x.productId === it.id);
          return (
            <li key={it.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-ink">
              <span className="tabular text-ink-muted">{i + 1}.</span> {productById(it.id).name}
              {m && <Badge kind={m.status === "confirmed" ? "estimate" : "assumption"}>{m.status === "confirmed" ? "Folosită" : "Draft"}</Badge>}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
