"use client";

import { useEffect } from "react";
import { NextStep } from "@/components/journey/NextStep";
import { UseDemoProfileButton } from "@/components/profile/UseDemoProfileButton";
import { StatCard } from "@/components/sim/StatCard";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { PLACEMENT_LABELS } from "@/content/labels";
import { explainOutcome } from "@/lib/explain";
import { summarize, type SimInput } from "@/lib/finance";
import { formatLei, formatPct, formatYears } from "@/lib/format";
import { actions, useDemoState } from "@/lib/useDemoState";
import { InflationAssumption } from "./InflationAssumption";

export function RealityCheck() {
  const { state, hydrated } = useDemoState();

  useEffect(() => {
    if (hydrated && state.profile) actions.markVisited("reality");
  }, [hydrated, state.profile]);

  if (!hydrated) return <PageSkeleton />;

  const p = state.profile;
  if (!p) {
    return (
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Mai întâi, un profil minim</h2>
        <p className="text-ink-muted">
          Reality Check folosește câteva cifre aproximative despre economiile tale. Poți completa profilul sau poți
          explora cu un profil exemplu, cu date fictive.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/profil">Completează profilul</ButtonLink>
          <UseDemoProfileButton />
        </div>
      </Card>
    );
  }

  const input: SimInput = {
    principal: p.savings,
    monthly: p.monthly,
    nominalPct: p.nominalPct,
    inflationPct: state.assumptions.inflationPct,
    years: p.years,
  };
  const s = summarize(input);
  const horizon = formatYears(p.years);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        {p.isDemo ? <Badge kind="fictional" /> : <Badge kind="user" />}
        <span>
          {p.alias ? `${p.alias} · ` : ""}
          {formatLei(p.savings)} în {PLACEMENT_LABELS[p.placement].toLowerCase()}
          {p.monthly > 0 ? ` · +${formatLei(p.monthly)}/lună` : ""} · randament estimat {formatPct(p.nominalPct)} · {horizon}
        </span>
        <ButtonLink href="/profil" variant="ghost" className="min-h-9 px-2 py-1 text-sm">
          Modifică profilul
        </ButtonLink>
      </div>

      <InflationAssumption value={state.assumptions.inflationPct} onCommit={actions.setInflation} />

      <section aria-labelledby="rezultat" className="space-y-4">
        <h2 id="rezultat" className="sr-only">
          Rezultat
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label={p.monthly > 0 ? "Total pus deoparte" : "Economiile tale azi"}
            value={formatLei(s.contributed)}
            kind={p.isDemo ? "fictional" : "user"}
            note={p.monthly > 0 ? `${formatLei(p.savings)} azi + ${formatLei(p.monthly)} pe lună, ${horizon}` : "Suma introdusă de tine"}
            testId="stat-contributed"
          />
          <StatCard
            label={`Valoare nominală peste ${horizon}`}
            value={formatLei(s.nominal)}
            kind="estimate"
            note={`Cu randament presupus de ${formatPct(p.nominalPct)} pe an`}
            testId="stat-nominal"
          />
          <StatCard
            label="Putere de cumpărare, în lei de azi"
            value={formatLei(s.real)}
            kind="estimate"
            emphasis="accent"
            note={`Cu inflație presupusă de ${formatPct(state.assumptions.inflationPct)} pe an`}
            testId="stat-real"
          />
        </div>
        <p aria-live="polite" className="max-w-[68ch] text-lg" data-testid="reality-explanation">
          {explainOutcome(input, s)}
        </p>
        <p className="text-ink-muted">
          Randamentul real anual estimat: <strong className="tabular text-ink">{formatPct(s.realRatePct, 2)}</strong>{" "}
          {s.realRatePct < -0.005
            ? "— randamentul presupus este sub inflația presupusă."
            : s.realRatePct > 0.005
              ? "— randamentul presupus este peste inflația presupusă."
              : "— randamentul presupus este egal cu inflația presupusă."}
        </p>
      </section>

      <details className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <summary className="font-semibold text-primary">Cum am calculat</summary>
        <div className="mt-4 max-w-[68ch] space-y-3 text-ink-muted">
          <p>
            <strong className="text-ink">Valoare nominală:</strong> economiile cresc anual cu randamentul presupus: P ×
            (1 + r)ⁿ. Depunerile lunare se fac la sfârșitul fiecărei luni și cresc cu rata lunară echivalentă (1 + r)^(1/12) − 1.
          </p>
          <p>
            <strong className="text-ink">Putere de cumpărare:</strong> valoarea nominală / (1 + i)ⁿ, unde i este inflația
            presupusă. Rezultatul arată ce ai putea cumpăra cu acei bani la prețurile de azi.
          </p>
          <p>
            <strong className="text-ink">Randament real:</strong> (1 + r) / (1 + i) − 1 = (1 + {formatPct(p.nominalPct)}) /
            (1 + {formatPct(state.assumptions.inflationPct)}) − 1 ≈ {formatPct(s.realRatePct, 2)}.
          </p>
          <p>
            Limitări: ratele sunt constante în fiecare an, nu includem costuri, comisioane sau impozite, iar rezultatul
            este o estimare, nu o prognoză sau o garanție.
          </p>
        </div>
      </details>

      <NextStep href="/simulator" label="Explorează scenarii în simulator" hint="Schimbă randamentul, inflația și orizontul și vezi graficul." />
    </div>
  );
}
