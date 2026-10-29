"use client";

import { AlertTriangle, ArrowRight, Check, ChevronDown, History, Info, ListChecks, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LevelMeter, ProductFacts } from "@/components/products/ProductFacts";
import { RiskQuestions } from "@/components/products/RiskQuestions";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { PRODUCTS, productById } from "@/content/products";
import { formatDateTime } from "@/lib/format";
import { currentGeneration, methodsOf, sameSnapshot, type Generation, type Method } from "@/lib/plans";
import { assessProducts, fitInputFromState } from "@/lib/productFit";
import type { RecommendRequest, RecommendResponse } from "@/lib/recommend";
import { useAuth } from "@/lib/useAuth";
import { actions, useDemoState } from "@/lib/useDemoState";

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "done"; fallbackReason?: string } | { kind: "error" };

export function Recommendations() {
  const { state, hydrated } = useDemoState();
  const { account } = useAuth();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  if (!hydrated) return <PageSkeleton />;
  const p = state.profile;
  const input = fitInputFromState(state);
  if (!account || !p || !input) {
    return (
      <Card className="space-y-4 text-center">
        <p className="text-ink">Recomandările se bazează pe profilul tău. Intră în cont sau creează unul, apoi completează profilul.</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={account ? "/profil" : "/intra"}>{account ? "Completează profilul" : "Intră în cont"}</ButtonLink>
        </div>
      </Card>
    );
  }

  const fits = assessProducts(input);
  // Only "consider" categories can be ranked; the others are explained separately.
  const excluded = fits.filter((f) => !f.eligible && productById(f.id).kind === "consider");
  const toKnow = fits.filter((f) => productById(f.id).kind !== "consider");

  const snapshot: RecommendRequest = { ...input, savings: p.savings, monthly: p.monthly, placement: p.placement, ageRange: p.ageRange };
  const current = currentGeneration(state.plans);
  // The saved set was generated from other inputs: the user has been re-profiled.
  const stale = current !== undefined && !sameSnapshot(current.snapshot, snapshot);
  const chosen = current ? methodsOf(state.plans, current.id) : [];

  async function generate() {
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/recomandari", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(snapshot) });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as RecommendResponse;
      actions.saveGeneration(snapshot, data);
      setStatus({ kind: "done", fallbackReason: data.fallbackReason });
    } catch {
      setStatus({ kind: "error" });
    }
  }

  return (
    <div className="space-y-8">
      <Card className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl text-ink">Patru întrebări despre tine</h2>
          <p className="text-sm text-ink-muted">
            Folosim și profilul tău: orizont de {p.years} ani, obiectivul ales și unde ții acum banii.{" "}
            <Link href="/profil" className="font-semibold text-primary underline underline-offset-2">Modifică profilul</Link>
          </p>
        </div>
        <RiskQuestions
          value={state.riskProfile}
          onChange={(v) => {
            actions.setRiskProfile(v);
            setStatus({ kind: "idle" });
          }}
        />
        <Button onClick={generate} aria-disabled={status.kind === "loading" || undefined} className="w-full sm:w-auto">
          <Sparkles aria-hidden className="size-4" />
          {status.kind === "loading" ? "Se pregătesc recomandările… (poate dura până la un minut)" : current ? "Generează din nou" : "Generează recomandările"}
        </Button>
      </Card>

      <div aria-live="polite">
        {status.kind === "error" && (
          <Alert tone="danger" title="Nu am putut genera recomandările">
            Verifică conexiunea și încearcă din nou.
          </Alert>
        )}
        {stale && (
          <Alert tone="assumption" title="Profilul tău s-a schimbat" className="mb-4">
            <span data-testid="stale-notice">
              Recomandările de mai jos au fost generate pe {formatDateTime(current!.createdAt)}, cu alte date. Generează din nou: setul de
              acum, cu metodele alese din el, trece în istoricul din{" "}
              <Link href="/metode" className="font-semibold text-primary underline underline-offset-2">Metodele mele</Link>.
            </span>
          </Alert>
        )}
        {current && (
          <Ranked
            generation={current}
            chosen={chosen}
            readOnly={stale}
            fallbackReason={status.kind === "done" ? status.fallbackReason : undefined}
          />
        )}
      </div>

      {current && excluded.length > 0 && (
        <details className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
          <summary className="min-h-11 cursor-pointer font-semibold text-ink">De ce nu îți recomandăm acum celelalte categorii ({excluded.length})</summary>
          <ul className="mt-3 space-y-3 text-sm">
            {excluded.map((f) => (
              <li key={f.id}>
                <span className="font-semibold text-ink">{productById(f.id).name}:</span>{" "}
                <span className="text-ink-muted">{f.cautions.join(" ")}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {current && (
        <section aria-labelledby="de-stiut" className="space-y-3" data-testid="to-know">
          <h2 id="de-stiut" className="text-xl text-ink">De știut înainte — nu le recomandăm</h2>
          <p className="text-sm text-ink-muted">Categorii despre care auzi des. Le explicăm ca să le înțelegi riscurile, dar nu le includem în recomandări.</p>
          <ul className="grid gap-3 md:grid-cols-2">
            {toKnow.map((f) => {
              const prod = PRODUCTS.find((x) => x.id === f.id)!;
              return (
                <li key={f.id}>
                  <Card className="h-full space-y-2 p-5" data-testid={`know-${f.id}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base text-ink">{prod.name}</h3>
                      <Badge kind={prod.kind === "caution" ? "assumption" : "user"}>{prod.kind === "caution" ? "Cu atenție" : "De verificat"}</Badge>
                    </div>
                    <p className="flex gap-2 text-sm text-ink">
                      <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
                      <span>{f.cautions.join(" ")}</span>
                    </p>
                    <details className="group rounded-[var(--radius-control)] bg-bg px-3 py-1.5">
                      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
                        Fișa categoriei <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="pb-2">
                        <ProductFacts product={prod} />
                      </div>
                    </details>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Alert tone="info" title="Ce sunt și ce nu sunt aceste recomandări">
        Îți arătăm categoriile de produse care se potrivesc, după reguli transparente, cu obiectivul, orizontul și răspunsurile tale.
        Nu recomandăm un produs, un fond sau o instituție anume, nu promitem randamente și nu evaluăm complet situația ta
        financiară — nu este consultanță de investiții autorizată. Înainte de orice decizie, verifică documentele produsului și
        instituția la ASF sau BNR.
      </Alert>

      {!stale && chosen.length > 0 && <MethodsBar count={chosen.length} />}
    </div>
  );
}

/**
 * Appears once at least one method is chosen and stays at the bottom of the screen while the
 * user scrolls the cards (thumb zone on phones), like a basket bar: count + one clear action.
 */
function MethodsBar({ count }: { count: number }) {
  return (
    <>
      {/* Spacer so the bar never covers the end of the page. */}
      <div aria-hidden className="h-20" />
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-3 shadow-[var(--shadow-raised)] backdrop-blur motion-safe:animate-[bar-in_200ms_ease-out]"
        data-testid="methods-bar"
      >
        <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-ink" aria-live="polite">
            <ListChecks aria-hidden className="size-5 shrink-0 text-primary" />
            <span>
              Ai ales <strong className="tabular">{count === 1 ? "o metodă" : `${count} metode`}</strong>
              <span className="hidden sm:inline"> — le găsești ca draft în Metodele mele</span>
            </span>
          </p>
          <ButtonLink href="/metode" className="shrink-0" data-testid="methods-bar-link">
            Mergi la Metodele mele <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>
      </div>
    </>
  );
}

function Ranked({
  generation: data,
  chosen,
  readOnly,
  fallbackReason,
}: {
  generation: Generation;
  chosen: Method[];
  readOnly: boolean;
  fallbackReason?: string;
}) {
  return (
    <section aria-labelledby="clasament" className="space-y-4" data-testid="recommendations">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 id="clasament" className="text-2xl text-ink">Recomandările tale</h2>
          <p className="text-xs text-ink-muted">Generate pe {formatDateTime(data.createdAt)}</p>
        </div>
        {data.source === "ai" ? (
          <Badge kind="estimate">Generat cu AI ({data.model}) · verificat după reguli</Badge>
        ) : (
          <Badge kind="estimate">Calculat după reguli</Badge>
        )}
      </div>
      {data.source === "reguli" && fallbackReason && (
        <p className="text-sm text-ink-muted" data-testid="fallback-reason">
          Am folosit regulile pentru că: {fallbackReason}
        </p>
      )}
      {chosen.length > 0 && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink">
          <History aria-hidden className="size-4 text-primary" />
          Ai ales {chosen.length === 1 ? "o metodă" : `${chosen.length} metode`} din acest set.{" "}
          <Link href="/metode" className="font-semibold text-primary underline underline-offset-2">Vezi Metodele mele</Link>
        </p>
      )}
      <ol className="space-y-4">
        {data.items.map((r, i) => {
          const p = productById(r.id);
          const method = chosen.find((m) => m.productId === r.id);
          return (
            <li key={r.id}>
              <Card className="space-y-3" data-testid={`rec-${r.id}`}>
                <div className="flex flex-wrap items-start gap-4">
                  <span className="tabular flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-on-primary" aria-hidden>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Eyebrow tone="muted">Locul {i + 1}</Eyebrow>
                    <h3 className="text-xl text-ink">{p.name}</h3>
                    <p className="text-sm text-ink-muted">{p.short}</p>
                  </div>
                  <div className="flex w-full flex-row flex-wrap gap-x-5 gap-y-1 pl-14 sm:w-auto sm:flex-col sm:pl-0">
                    <LevelMeter label="Risc" level={p.risk.level} />
                    <LevelMeter label="Lichiditate" level={p.liquidity.level} />
                  </div>
                </div>
                <p className="flex gap-2 text-ink">
                  <Info aria-hidden className="mt-1 size-4 shrink-0 text-primary" />
                  <span><strong>De ce pentru tine:</strong> {r.why}</span>
                </p>
                {r.watchOut && (
                  <p className="flex gap-2 text-ink">
                    <AlertTriangle aria-hidden className="mt-1 size-4 shrink-0 text-danger" />
                    <span><strong>La ce să fii atent:</strong> {r.watchOut}</span>
                  </p>
                )}
                <details className="group rounded-[var(--radius-control)] bg-bg px-4 py-2">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-semibold text-primary [&::-webkit-details-marker]:hidden">
                    Fișa categoriei <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pb-3">
                    <ProductFacts product={p} />
                  </div>
                </details>
                {!readOnly && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
                    {method?.status === "confirmed" ? (
                      <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-success">
                        <Check aria-hidden className="size-4" /> O folosești · confirmată în Metodele mele
                      </span>
                    ) : (
                      <Button
                        variant={method ? "secondary" : "primary"}
                        aria-pressed={Boolean(method)}
                        onClick={() => actions.toggleMethod(r.id)}
                        data-testid={`choose-${r.id}`}
                      >
                        {method ? <Check aria-hidden className="size-4" /> : <Plus aria-hidden className="size-4" />}
                        {method ? "Aleasă · în Metodele mele" : "Aleg această metodă"}
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
