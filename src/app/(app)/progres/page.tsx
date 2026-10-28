import type { Metadata } from "next";
import { PageHeader } from "@/components/journey/NextStep";
import { ProgressView } from "@/components/progress/ProgressView";

export const metadata: Metadata = { title: "Progres" };

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader title="Progresul tău" lead="Ce ai parcurs până acum și ce mai poți explora." />
      <ProgressView />
    </div>
  );
}
