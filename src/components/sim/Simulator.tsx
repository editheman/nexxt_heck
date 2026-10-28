"use client";

import { RotateCcw, Table2 } from "lucide-react";
import { useEffect, useState } from "react";
import { NextStep } from "@/components/journey/NextStep";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/components/ui/cn";
import { explainOutcome } from "@/lib/explain";
import { LIMITS, project, summarize, validateSimInput, type SimInput } from "@/lib/finance";
import { formatLei, formatPct, formatYears } from "@/lib/format";
import type { DemoState } from "@/lib/storage";
import { actions, useDemoState } from "@/lib/useDemoState";
import { ProjectionChart } from "./ProjectionChart";
import { ProjectionTable } from "./ProjectionTable";
import { SimControl } from "./SimControl";
import { StatCard } from "./StatCard";

type Draft = Record<keyof SimInput, number | null>;

const EXAMPLE: SimInput = { principal: 10000, monthly: 0, nominalPct: 0, inflationPct: 5, years: 10 };

function seed(state: DemoState): SimInput {
  const p = state.profile;
  if (!p) return { ...EXAMPLE, inflationPct: state.assumptions.inflationPct };
  return { principal: p.savings, monthly: p.monthly, nominalPct: p.nominalPct, inflationPct: state.assumptions.inflationPct, years: p.years };
}

export function Simulator() {
  const { state, hydrated } = useDemoState();
  useEffect(() => {
    if (hydrated) actions.markVisited("simulator");
  }, [hydrated]);
  if (!hydrated) return <PageSkeleton />;
  return <SimulatorInner initial={seed(state)} fromProfile={state.profile !== null} isDemo={state.profile?.isDemo ?? false} />;
}

function SimulatorInner({ initial, fromProfile, isDemo }: { initial: SimInput; fromProfile: boolean; isDemo: boolean }) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [lastValid, setLastValid] = useState<SimInput>(initial);
  const [showTable, setShowTable] = useState(false);

  const complete = Object.values(draft).every((v) => v !== null);
  const errors = complete ? validateSimInput(draft as SimInput) : {};
  const missing = (k: keyof SimInput) => (draft[k] === null ? "Completează acest câmp." : undefined);
  const valid = complete && Object.keys(errors).length === 0;
  if (valid && JSON.stringify(draft) !== JSON.stringify(lastValid)) setLastValid(draft as SimInput);

  const input = valid ? (draft as SimInput) : lastValid;
  const rows = project(input);
  const summary = summarize(input);

  const set = (k: keyof SimInput) => (v: number | null) => setDraft((d) => ({ ...d, [k]: v }));
  const presets: Array<{ label: string; apply: (d: Draft) => Draft }> = [
    { label: "Bani ținuți fără randament", apply: (d) => ({ ...d, nominalPct: 0 }) },
    { label: "Randament egal cu inflația", apply: (d) => ({ ...d, nominalPct: d.inflationPct ?? 5 }) },
    { label: "Randament cu 3 puncte peste inflație", apply: (d) => ({ ...d, nominalPct: Math.min(LIMITS.ratePctMax, (d.inflationPct ?? 5) + 3) }) },
  ];

  return (
    <div className="space-y-8">
      {!fromProfile && (
        <Alert tone="info" title="Pornești de la un exemplu">
          Valorile de mai jos sunt un exemplu fictiv. <a href="/profil" className="font-semibold text-primary underline underline-offset-2">Completează profilul</a> ca să pornești de la cifrele tale.
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Card className="space-y-6 self-start">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Ipotezele tale</h2>
            <Button variant="ghost" className="min-h-9 px-2 py-1 text-sm" onClick={() => setDraft(initial)}>
              <RotateCcw aria-hidden className="size-4" />
              Resetează
            </Button>
          </div>
          <SimControl id="sim-principal" label="Sumă inițială" suffix="lei" min={0} max={500000} step={1000} value={draft.principal} onChange={set("principal")} error={missing("principal") ?? errors.principal} badge={fromProfile ? <Badge kind={isDemo ? "fictional" : "user"} /> : <Badge kind="fictional" />} />
          <SimControl id="sim-monthly" label="Depunere lunară" suffix="lei" min={0} max={10000} step={50} value={draft.monthly} onChange={set("monthly")} error={missing("monthly") ?? errors.monthly} />
          <SimControl id="sim-return" label="Randament nominal anual" suffix="%" min={LIMITS.ratePctMin} max={LIMITS.ratePctMax} step={0.5} value={draft.nominalPct} onChange={set("nominalPct")} error={missing("nominalPct") ?? errors.nominalPct} badge={<Badge kind="assumption" />} />
          <SimControl id="sim-inflation" label="Inflație anuală" suffix="%" min={LIMITS.ratePctMin} max={LIMITS.ratePctMax} step={0.5} value={draft.inflationPct} onChange={set("inflationPct")} error={missing("inflationPct") ?? errors.inflationPct} badge={<Badge kind="assumption" />} />
          <SimControl id="sim-years" label="Orizont" suffix="ani" min={0} max={LIMITS.yearsMax} step={1} value={draft.years} onChange={set("years")} error={missing("years") ?? errors.years} />

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Scenarii ipotetice rapide</legend>
            <div className="flex flex-col gap-2">
              {presets.map((p) => (
                <Button key={p.label} variant="secondary" className="justify-start text-left text-sm" onClick={() => setDraft((d) => p.apply(d))}>
                  {p.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-ink-muted">Scenariile modifică doar randamentul presupus. Nu reprezintă produse reale.</p>
          </fieldset>
        </Card>

        <div className="min-w-0 space-y-6">
          {!valid && (
            <Alert tone="danger" role="status" title="Corectează valorile marcate">
              Graficul arată ultimul scenariu valid până atunci.
            </Alert>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total depus" value={formatLei(summary.contributed)} kind={fromProfile && !isDemo ? "user" : "fictional"} />
            <StatCard label={`Nominal după ${formatYears(input.years)}`} value={formatLei(summary.nominal)} kind="estimate" testId="sim-nominal" />
            <StatCard label="În lei de azi" value={formatLei(summary.real)} kind="estimate" emphasis="accent" testId="sim-real" />
          </div>
          <p aria-live="polite" className="text-base" data-testid="sim-explanation">
            {explainOutcome(input, summary)} Randament real anual: {formatPct(summary.realRatePct, 2)}.
          </p>

          <Card className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Evoluție an cu an</h2>
              <Button variant="secondary" className="min-h-9 py-1 text-sm" aria-pressed={showTable} onClick={() => setShowTable((v) => !v)}>
                <Table2 aria-hidden className="size-4" />
                {showTable ? "Vezi graficul" : "Vezi tabelul"}
              </Button>
            </div>
            <div className={cn(showTable && "hidden")}>
              <ProjectionChart rows={rows} showContributed={input.monthly > 0} />
              <p className="mt-2 text-sm text-ink-muted">
                Linia continuă: valoarea nominală. Linia întreruptă: puterea de cumpărare în lei de azi.
                {input.monthly > 0 ? " Linia punctată: totalul depus." : ""}
              </p>
            </div>
            {showTable && <ProjectionTable rows={rows} caption="Evoluția valorii nominale și a puterii de cumpărare, pe ani" />}
          </Card>

          <Alert tone="assumption" title="Ipoteze, nu prognoze">
            Randamentul și inflația sunt constante în fiecare an și nu includ costuri sau impozite. Randamentele reale
            variază și pot fi negative; nimic de aici nu este o recomandare sau o garanție.
          </Alert>
        </div>
      </div>

      <NextStep href="/fraude" label="Exersează: recunoaște o fraudă" hint="Patru scenarii fictive, inspirate din tentative reale." />

      {/* On small screens the results sit below the controls; keep the key numbers in view while adjusting. */}
      <div aria-hidden className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <div className="tabular mx-auto flex max-w-[1120px] items-center justify-between gap-4 text-sm">
          <span>
            <span className="block text-ink-muted">Nominal</span>
            <span className="font-heading font-semibold text-primary">{formatLei(summary.nominal)}</span>
          </span>
          <span className="text-right">
            <span className="block text-ink-muted">În lei de azi · estimare</span>
            <span className="font-heading font-semibold text-accent">{formatLei(summary.real)}</span>
          </span>
        </div>
      </div>
      <div aria-hidden className="h-12 lg:hidden" />
    </div>
  );
}
