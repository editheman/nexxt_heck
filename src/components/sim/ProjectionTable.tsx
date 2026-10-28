import { formatLei } from "@/lib/format";
import type { ProjectionRow } from "@/lib/finance";

export function ProjectionTable({ rows, caption }: { rows: ProjectionRow[]; caption: string }) {
  return (
    <div className="max-h-[360px] overflow-auto rounded-[var(--radius-control)] border border-border">
      <table className="tabular w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 bg-surface-muted text-left">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">An</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Total depus</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Valoare nominală</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Putere de cumpărare (lei de azi)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.year} className="border-t border-border">
              <th scope="row" className="px-3 py-2 text-left font-normal">{r.year}</th>
              <td className="px-3 py-2 text-right">{formatLei(r.contributed)}</td>
              <td className="px-3 py-2 text-right">{formatLei(r.nominal)}</td>
              <td className="px-3 py-2 text-right">{formatLei(r.real)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
