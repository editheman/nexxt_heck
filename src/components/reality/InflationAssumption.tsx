"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { NumberField } from "@/components/ui/NumberField";
import { sourceByName } from "@/content/sources";
import { LIMITS } from "@/lib/finance";

/** Editable illustrative inflation assumption. Only valid values are committed. */
export function InflationAssumption({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [error, setError] = useState<string>();
  const ins = sourceByName("INS");
  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-assumption/30 bg-assumption-soft p-5">
      <NumberField
        id="inflation"
        label="Inflație anuală presupusă"
        badge={<Badge kind="assumption">Ipoteză ilustrativă</Badge>}
        helper="Aceeași rată pentru fiecare an. Nu este o prognoză și nici rata oficială actuală."
        suffix="% / an"
        value={value}
        error={error}
        onChange={(v) => {
          if (v === null || v < LIMITS.ratePctMin || v > LIMITS.ratePctMax) {
            setError(`Alege o valoare între ${LIMITS.ratePctMin}% și ${LIMITS.ratePctMax}%.`);
            return;
          }
          setError(undefined);
          onCommit(v);
        }}
        className="max-w-sm"
      />
      <p className="text-sm text-ink">
        Pentru date reale, consultă rata oficială a inflației publicată de{" "}
        <a href={ins.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2">
          Institutul Național de Statistică (INS)
        </a>
        .
      </p>
    </div>
  );
}
