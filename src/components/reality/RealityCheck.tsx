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
import { CPI_ANNUAL_INDEX, EUR_RON_ANNUAL_AVG, LATEST_DATA_YEAR } from "@/content/macro-ro";
import { sourceByName } from "@/content/sources";
import { pickEquivalents } from "@/lib/equivalents";
import { eurConversion, historicalInflation } from "@/lib/finance";
import { formatEur, formatIncomeShare, formatLei, formatPct } from "@/lib/format";
import { actions, useDemoState } from "@/lib/useDemoState";
import { EquivalentsList } from "./EquivalentsList";
import { WindowPicker } from "./WindowPicker";

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
          Reality Check folosește suma aproximativă a economiilor tale. Poți completa profilul sau poți explora cu un
          profil exemplu, cu date fictive.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/profil">Completează profilul</ButtonLink>
          <UseDemoProfileButton />
        </div>
      </Card>
    );
  }

  const years = state.reality.years;
  const h = historicalInflation(p.savings, years, LATEST_DATA_YEAR, CPI_ANNUAL_INDEX);
  const eur = eurConversion(p.savings, EUR_RON_ANNUAL_AVG[h.baseYear], EUR_RON_ANNUAL_AVG[h.endYear]);
  const picked = pickEquivalents(h.loss);
  const ins = sourceByName("INS");
  const bnr = sourceByName("BNR");
  const rows = Array.from({ length: years }, (_, k) => h.baseYear + 1 + k);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        {p.isDemo ? <Badge kind="fictional" /> : <Badge kind="user" />}
        <span>
          {p.alias ? `${p.alias} · ` : ""}
          {formatLei(p.savings)} în {PLACEMENT_LABELS[p.placement].toLowerCase()}
        </span>
        <ButtonLink href="/profil" variant="ghost" className="min-h-9 px-2 py-1 text-sm">
          Modifică profilul
        </ButtonLink>
      </div>

      <WindowPicker value={years} onChange={actions.setRealityYears} />

      <section aria-labelledby="rezultat" className="space-y-4">
        <h2 id="rezultat" className="sr-only">
          Rezultat
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Economiile tale"
            value={formatLei(h.nominal)}
            kind={p.isDemo ? "fictional" : "user"}
            note="Presupunem că au stat fără dobândă (numerar sau cont curent)."
            testId="stat-nominal"
          />
          <StatCard
            label={`Cât au crescut prețurile, ${h.baseYear}–${h.endYear}`}
            value={`+${formatPct(h.cumulativeInflationPct)}`}
            kind="official"
            note={`IPC INS: prețurile medii din ${h.endYear} față de ${h.baseYear}.`}
            testId="stat-inflation"
          />
          <StatCard
            label={`Ce cumpără azi, în lei din ${h.baseYear}`}
            value={formatLei(h.real)}
            kind="estimate"
            emphasis="accent"
            note="Calculat din ratele oficiale ale inflației, an cu an."
            testId="stat-real"
          />
        </div>
        <p aria-live="polite" className="max-w-[68ch] text-lg" data-testid="reality-explanation">
          Dacă ai fi ținut {formatLei(h.nominal)} fără dobândă din {h.baseYear} până în {h.endYear}, azi ar cumpăra cât
          cumpărau {formatLei(h.real)} în {h.baseYear}. Inflația a „mâncat”{" "}
          <strong className="tabular" data-testid="reality-loss">
            {formatLei(h.loss)}
          </strong>{" "}
          din puterea lor de cumpărare.
        </p>
        {p.income !== null && formatIncomeShare(h.loss, p.income) && (
          <p className="text-ink-muted" data-testid="reality-income">
            Raportat la venitul tău net de azi ({formatLei(p.income)} pe lună), asta înseamnă cam{" "}
            <strong className="text-ink">{formatIncomeShare(h.loss, p.income)}</strong>.
          </p>
        )}
        <p className="flex flex-wrap items-center gap-2 text-ink-muted" data-testid="reality-eur">
          <Badge kind="official">Curs BNR</Badge>
          <span>
            În euro, aceeași sumă valora {formatEur(eur.eurFrom)} în {h.baseYear} și {formatEur(eur.eurTo)} în{" "}
            {h.endYear} (curs mediu anual {formatRate(EUR_RON_ANNUAL_AVG[h.baseYear])} → {formatRate(EUR_RON_ANNUAL_AVG[h.endYear])} lei/€),
            adică leul s-a {eur.leuChangePct < 0 ? "depreciat" : "apreciat"} cu {formatPct(Math.abs(eur.leuChangePct))} față de euro.
          </span>
        </p>
      </section>

      <EquivalentsList picked={picked} loss={h.loss} baseYear={h.baseYear} endYear={h.endYear} />

      <details className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <summary className="font-semibold text-primary">Cum am calculat și de unde sunt datele</summary>
        <div className="mt-4 max-w-[68ch] space-y-3 text-ink-muted">
          <p>
            <strong className="text-ink">Inflația este fixă, nu o ipoteză:</strong> folosim rata medie anuală a inflației
            publicată de{" "}
            <a href={ins.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2">
              INS
            </a>{" "}
            (indicele prețurilor de consum, an precedent = 100), pentru {h.baseYear + 1}–{h.endYear}.
          </p>
          <p>
            <strong className="text-ink">Putere de cumpărare:</strong> P<sub>real</sub> = P / ∏(1 + i<sub>t</sub>) ={" "}
            {formatLei(h.nominal)} / {h.priceFactor.toLocaleString("ro-RO", { maximumFractionDigits: 4 })} ≈ {formatLei(h.real)}.
            Produsul indicilor medii anuali compară nivelul mediu al prețurilor din {h.endYear} cu cel din {h.baseYear}.
          </p>
          <p>
            <strong className="text-ink">Pierdere:</strong> P − P<sub>real</sub> ≈ {formatLei(h.loss)}, exprimată în lei din{" "}
            {h.baseYear}.
          </p>
          <p>
            <strong className="text-ink">Euro:</strong> cursul mediu anual EUR/RON calculat de{" "}
            <a href={bnr.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2">
              BNR
            </a>{" "}
            (media celor 12 medii lunare ale cursului oficial).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full max-w-md text-sm">
              <caption className="pb-2 text-left font-semibold text-ink">Rata medie anuală a inflației (INS)</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-1.5 pr-4 font-semibold">An</th>
                  <th scope="col" className="py-1.5 pr-4 font-semibold">Indice (an precedent = 100)</th>
                  <th scope="col" className="py-1.5 font-semibold">Inflație</th>
                </tr>
              </thead>
              <tbody className="tabular">
                {rows.map((y) => (
                  <tr key={y} className="border-b border-border/60">
                    <th scope="row" className="py-1.5 pr-4 font-normal">{y}</th>
                    <td className="py-1.5 pr-4">{CPI_ANNUAL_INDEX[y].toLocaleString("ro-RO", { minimumFractionDigits: 2 })}</td>
                    <td className="py-1.5">{formatPct(CPI_ANNUAL_INDEX[y] - 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Limitări: presupunem că suma nu a primit dobândă; o dobândă sau un randament ar fi redus pierderea. IPC
            măsoară un coș mediu de consum — inflația ta personală poate fi diferită. Echivalențele folosesc prețuri
            orientative de azi și sunt o metaforă educațională, nu o sumă exactă. Nu este o recomandare financiară.
          </p>
        </div>
      </details>

      <NextStep
        href="/simulator"
        label="Proiectează viitorul în simulator"
        hint="Acolo alegi tu ipotezele de randament și inflație — sunt ipoteze, nu date oficiale."
      />
    </div>
  );
}

function formatRate(v: number) {
  return v.toLocaleString("ro-RO", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}
