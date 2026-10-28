import { Badge, type BadgeKind } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";

export function StatCard({
  label,
  value,
  kind,
  note,
  emphasis,
  testId,
}: {
  label: string;
  value: string;
  kind: BadgeKind;
  note?: React.ReactNode;
  emphasis?: "primary" | "accent";
  testId?: string;
}) {
  return (
    <Card className="flex h-full flex-col gap-3 p-5">
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm font-semibold text-ink-muted">{label}</p>
        <Badge kind={kind} />
      </div>
      <p
        data-testid={testId}
        className={cn(
          "tabular font-heading text-3xl font-semibold",
          emphasis === "accent" ? "text-accent" : "text-primary",
        )}
      >
        {value}
      </p>
      {note && <p className="text-sm text-ink-muted">{note}</p>}
    </Card>
  );
}
