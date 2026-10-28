import type { Metadata } from "next";
import { OnboardingStep } from "@/components/journey/Onboarding";
import { PageHeader } from "@/components/journey/NextStep";
import { RealityCheck } from "@/components/reality/RealityCheck";

export const metadata: Metadata = { title: "Reality Check" };

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader
        step={<OnboardingStep n={2} />}
        title="Reality Check"
        lead="Suma din cont și puterea ei de cumpărare sunt lucruri diferite. Iată cât ar fi pierdut economiile tale în ultimii ani, calculat cu inflația oficială din România."
      />
      <RealityCheck />
    </div>
  );
}
