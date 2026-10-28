"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SimControl } from "@/components/sim/SimControl";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { FACTS } from "@/content/facts";
import { CPI_ANNUAL_INDEX, DEFAULT_REALITY_WINDOW, LATEST_DATA_YEAR } from "@/content/macro-ro";
import { pickEquivalents } from "@/lib/equivalents";
import { historicalInflation, LIMITS } from "@/lib/finance";
import { formatCount, formatIncomeShare, formatLei, formatPct } from "@/lib/format";
import { INDUSTRIES, type Industry } from "@/lib/schemas/facts";
import { actions, useDemoState } from "@/lib/useDemoState";

const INCOME_DEFAULT = 5_500;
const SAVINGS_DEFAULT = 20_000;

/**
 * Give-to-get funnel (CLAUDE.md §3.1–3.3): industry chip → instant sector
 * insight → inline reveal with two sliders → instant loss → full Reality Check.
 * Everything expands in place; there are no modals.
 */
export function IndustryFunnel() {
  const router = useRouter();
  const { state, hydrated } = useDemoState();
  const [picked, setPicked] = useState<Industry | null>(null);
  const [open, setOpen] = useState(false);
  // undefined = untouched (use saved/default), null = cleared by the user.
  const [income, setIncome] = useState<number | null | undefined>(undefined);
  const [savings, setSavings] = useState<number | null | undefined>(undefined);

  // Before the user touches anything, reflect what is already saved in this browser.
  const industry = picked ?? (hydrated ? state.industry : null);
  const profile = hydrated && state.profile && !state.profile.isDemo ? state.profile : null;
  const incomeValue = income === undefined ? (profile?.income ?? INCOME_DEFAULT) : income;
  const savingsValue = savings === undefined ? (profile?.savings ?? SAVINGS_DEFAULT) : savings;
  const insight = industry ? FACTS.industries.find((i) => i.industry === industry)! : null;

  const incomeError = validAmount(incomeValue) ? undefined : "Introdu o sumă între 0 și 100.000.000 lei.";
  const savingsError = validAmount(savingsValue) ? undefined : "Introdu o sumă între 0 și 100.000.000 lei.";
  const ready = validAmount(incomeValue) && validAmount(savingsValue);

  function choose(i: Industry) {
    setPicked(i);
    actions.setIndustry(i);
  }

  function seeFull() {
    if (!validAmount(incomeValue) || !validAmount(savingsValue)) return;
    actions.saveQuick(savingsValue, incomeValue);
    router.push("/reality-check");
  }

  return (
    <section id="domeniu" aria-labelledby="domeniu-title" className="scroll-mt-24 space-y-6">
      <fieldset className="space-y-3">
        <legend id="domeniu-title" className="font-heading text-2xl font-semibold text-primary">
          În ce domeniu activezi?
        </legend>
        <p className="text-ink-muted">Un click, fără cont. Îți arătăm o cifră reală despre sectorul tău.</p>
        <div className="flex flex-wrap gap-2" data-testid="industry-chips">
          {INDUSTRIES.map((id) => (
            <label
              key={id}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-border-strong bg-surface px-4 text-sm font-semibold text-primary transition-colors hover:border-primary has-checked:border-primary has-checked:bg-primary has-checked:text-on-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring"
            >
              <input
                type="radio"
                name="industry"
                value={id}
                checked={industry === id}
                onChange={() => choose(id)}
                className="sr-only"
              />
              {FACTS.industries.find((i) => i.industry === id)!.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div aria-live="polite">
        {insight && (
          <Card className="space-y-4" data-testid="sector-insight">
            <div className="flex flex-wrap items-center gap-2">
              <Badge kind={insight.kind === "official" ? "official" : "estimate"}>
                {insight.kind === "official" ? "Date oficiale INS" : "Calculat din date oficiale"}
              </Badge>
              <span className="text-sm text-ink-muted">{insight.label}</span>
            </div>
            <h3 className="text-xl font-semibold">{insight.headline}</h3>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
              <p className="tabular font-heading text-4xl font-semibold text-primary" data-testid="sector-stat">
                {insight.stat.value}
              </p>
              <p className="text-sm text-ink-muted">{insight.stat.caption}</p>
            </div>
            <p className="max-w-[68ch] text-ink">{insight.body}</p>
            <p className="text-xs text-ink-muted">
              Surse:{" "}
              {insight.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && ", "}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">
                    {s.label}
                  </a>
                </span>
              ))}
            </p>

            <Button
              variant={open ? "secondary" : "primary"}
              aria-expanded={open}
              aria-controls="calcul-personal"
              onClick={() => setOpen((o) => !o)}
            >
              Vrei să vezi calculul exact pe buzunarul tău?
              <ChevronDown aria-hidden className={cn("size-4 transition-transform", open && "rotate-180")} />
            </Button>
          </Card>
        )}
      </div>

      {insight && open && (
        <Card id="calcul-personal" className="space-y-6" data-testid="quick-calc">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">Două cifre aproximative, atât</h3>
            <p className="text-sm text-ink-muted">
              Fără CNP, fără bancă, fără angajator. Rămân doar în browserul tău și nu apar niciodată în comparațiile cu
              prietenii.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <SimControl
              id="quick-income"
              label="Venit net lunar"
              suffix="lei"
              min={0}
              max={30_000}
              step={100}
              value={incomeValue}
              onChange={setIncome}
              error={incomeError}
              badge={<Badge kind="user" />}
            />
            <SimControl
              id="quick-savings"
              label="Economii în numerar sau cont curent"
              suffix="lei"
              min={0}
              max={500_000}
              step={500}
              value={savingsValue}
              onChange={setSavings}
              error={savingsError}
              badge={<Badge kind="user" />}
            />
          </div>

          {validAmount(incomeValue) && validAmount(savingsValue) && <QuickResult savings={savingsValue} income={incomeValue} />}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button onClick={seeFull} disabled={!ready}>
              Vezi calculul complet <ArrowRight aria-hidden className="size-4" />
            </Button>
            <Link href="/profil" className="text-sm font-semibold text-primary underline underline-offset-2">
              Prefer profilul detaliat
            </Link>
          </div>
        </Card>
      )}
    </section>
  );
}

function validAmount(v: number | null): v is number {
  return v !== null && Number.isFinite(v) && v >= 0 && v <= LIMITS.amountMax;
}

function QuickResult({ savings, income }: { savings: number; income: number }) {
  const h = historicalInflation(savings, DEFAULT_REALITY_WINDOW, LATEST_DATA_YEAR, CPI_ANNUAL_INDEX);
  const top = pickEquivalents(h.loss)[0];
  const share = formatIncomeShare(h.loss, income);
  return (
    <div aria-live="polite" className="space-y-2 rounded-[var(--radius-control)] bg-accent-soft p-4" data-testid="quick-result">
      <div className="flex flex-wrap gap-2">
        <Badge kind="estimate" />
        <Badge kind="official">Inflație INS {h.baseYear + 1}–{h.endYear}</Badge>
      </div>
      {h.loss > 0 ? (
        <>
          <p className="text-lg">
            Ținuți fără dobândă din {h.baseYear}, cei {formatLei(savings)} au pierdut{" "}
            <strong className="tabular" data-testid="quick-loss">
              {formatLei(h.loss)}
            </strong>{" "}
            din puterea de cumpărare (prețuri +{formatPct(h.cumulativeInflationPct)}).
          </p>
          {share && <p className="text-ink-muted">Cam {share}.</p>}
          {top && (
            <p className="text-ink-muted">
              Sau, ca metaforă:{" "}
              {top.kind === "fraction"
                ? `${formatPct(top.quantity)} ${top.item.fraction!.label}`
                : formatCount(top.quantity, top.item.one, top.item.many)}
              .
            </p>
          )}
        </>
      ) : (
        <p>Fără economii în numerar, inflația nu are ce „mânca” aici. Mută sliderul ca să vezi efectul.</p>
      )}
    </div>
  );
}
