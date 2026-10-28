import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { PickedEquivalent } from "@/lib/equivalents";
import { formatCount, formatLei, formatPct } from "@/lib/format";

/** "What inflation ate" — an educational opportunity-cost metaphor, clearly labelled as such. */
export function EquivalentsList({
  picked,
  loss,
  baseYear,
  endYear,
}: {
  picked: PickedEquivalent[];
  loss: number;
  baseYear: number;
  endYear: number;
}) {
  return (
    <section aria-labelledby="echivalente" className="space-y-4">
      <div className="space-y-2">
        <Eyebrow dot icon={<ShoppingBag aria-hidden className="size-3.5" />}>
          Echivalențe
        </Eyebrow>
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="echivalente" className="text-2xl text-ink">
            Ce puteai cumpăra cu banii mâncați de inflație
          </h2>
          <Badge kind="assumption">Metaforă · prețuri orientative</Badge>
        </div>
        <p className="max-w-[68ch] text-ink-muted">
          Banii n-au dispărut din cont, ci din coșul de cumpărături. Cei {formatLei(loss)} pierduți între {baseYear} și{" "}
          {endYear}, traduși în lucruri concrete:
        </p>
      </div>

      {picked.length === 0 ? (
        <Card className="text-ink-muted" data-testid="equivalents-empty">
          Pierderea este prea mică pentru a cumpăra ceva din lista noastră — sau nu ai economii introduse. Cu cât suma
          și perioada sunt mai mari, cu atât efectul inflației se vede mai clar.
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="equivalents">
          {picked.map(({ item, quantity, kind }) => (
            <li key={item.id}>
              <Card bar="danger" className="flex h-full flex-col gap-2 p-5 pt-6">
                <Amount
                  text={kind === "fraction" ? `${formatPct(quantity)} ${item.fraction!.label}` : formatCount(quantity, item.one, item.many)}
                />
                <p className="font-mono text-xs text-ink-muted">Preț orientativ: {formatLei(item.priceRon)}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm text-ink-muted">
        Prețurile sunt orientative, rotunjite, și servesc doar la comparație. Calculul pierderii de mai sus folosește
        exclusiv date oficiale.
      </p>
    </section>
  );
}

/** "3 luni de chirie…" → big "3", readable "luni de chirie…" (one sentence for screen readers). */
function Amount({ text }: { text: string }) {
  const i = text.indexOf(" ");
  return (
    <p className="text-ink">
      <span className="tabular block text-3xl font-bold text-danger">{text.slice(0, i)}</span>{" "}
      <span className="block font-semibold">{text.slice(i + 1)}</span>
    </p>
  );
}
