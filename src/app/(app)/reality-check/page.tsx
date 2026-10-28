import type { Metadata } from "next";
import { PageHeader } from "@/components/journey/NextStep";
import { RealityCheck } from "@/components/reality/RealityCheck";

export const metadata: Metadata = { title: "Reality Check" };

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader
        step="Pasul 2 din 5"
        title="Reality Check"
        lead="Suma din cont și puterea ei de cumpărare sunt lucruri diferite. Iată cum arată economiile tale în lei de azi, sub ipoteze pe care le poți schimba."
      />
      <RealityCheck />
    </div>
  );
}
