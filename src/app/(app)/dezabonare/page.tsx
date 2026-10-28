import type { Metadata } from "next";
import { PageHeader } from "@/components/journey/NextStep";
import { UnsubscribePanel } from "@/components/newsletter/UnsubscribePanel";

export const metadata: Metadata = { title: "Dezabonare" };

export default function Page() {
  return (
    <div className="mx-auto max-w-[720px] space-y-8">
      <PageHeader step="Digest săptămânal" title="Dezabonare" lead="Renunți cu un singur clic, fără întrebări." />
      <UnsubscribePanel />
      <p className="text-sm text-ink-muted">
        În versiunea de producție, fiecare e-mail va conține un link de dezabonare personal care funcționează fără cont
        și fără parolă.
      </p>
    </div>
  );
}
