import type { Metadata } from "next";
import { PageHeader } from "@/components/journey/NextStep";
import { ScamExercise } from "@/components/scam/ScamExercise";

export const metadata: Metadata = { title: "Recunoaște fraudele" };

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Recunoaște o fraudă înainte să coste"
        lead="Mesaje fictive, construite după tipare frecvente. Alege ce ai face și află de ce."
      />
      <ScamExercise />
    </div>
  );
}
