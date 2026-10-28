import type { Metadata } from "next";
import { PageHeader } from "@/components/journey/NextStep";
import { ModuleList } from "@/components/learn/ModuleList";

export const metadata: Metadata = { title: "Învață" };

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader
        step="Pasul 5 din 5"
        title="Traseul de învățare"
        lead="Șapte module scurte despre inflație, randamente, lichiditate, diversificare, costuri, taxe și fraude. Fiecare se încheie cu un quiz cu explicații."
      />
      <ModuleList />
    </div>
  );
}
