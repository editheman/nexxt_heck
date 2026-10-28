"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatLei, formatYears } from "@/lib/format";
import type { ProjectionRow } from "@/lib/finance";
import { useReducedMotion } from "@/lib/useReducedMotion";

const compact = new Intl.NumberFormat("ro-RO", { notation: "compact", maximumFractionDigits: 1 });

const SERIES = {
  nominal: { name: "Valoare nominală", color: "var(--color-primary)" },
  real: { name: "Putere de cumpărare (lei de azi)", color: "var(--color-accent)" },
  contributed: { name: "Total depus", color: "var(--color-border-strong)" },
} as const;

export function ProjectionChart({ rows, showContributed }: { rows: ProjectionRow[]; showContributed: boolean }) {
  const reduced = useReducedMotion();
  return (
    <div className="h-[320px] w-full sm:h-[360px] lg:short:h-[220px]" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 13 }}
            tickFormatter={(y: number) => formatYears(y)}
            interval="preserveStartEnd"
          />
          <YAxis
            width={64}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 13 }}
            tickFormatter={(v: number) => compact.format(v)}
          />
          <Tooltip
            formatter={(value, name) => [formatLei(Number(value)), name]}
            labelFormatter={(y) => `Anul ${y}`}
            contentStyle={{ borderRadius: 8, borderColor: "var(--color-border)", fontSize: 14 }}
          />
          <Legend wrapperStyle={{ fontSize: 14, paddingTop: 8 }} />
          <Line
            type="monotone"
            dataKey="nominal"
            name={SERIES.nominal.name}
            stroke={SERIES.nominal.color}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={!reduced}
          />
          <Line
            type="monotone"
            dataKey="real"
            name={SERIES.real.name}
            stroke={SERIES.real.color}
            strokeWidth={2.5}
            strokeDasharray="7 5"
            dot={false}
            isAnimationActive={!reduced}
          />
          {showContributed && (
            <Line
              type="monotone"
              dataKey="contributed"
              name={SERIES.contributed.name}
              stroke={SERIES.contributed.color}
              strokeWidth={2}
              strokeDasharray="2 4"
              dot={false}
              isAnimationActive={!reduced}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
