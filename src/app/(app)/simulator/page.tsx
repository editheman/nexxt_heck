import type { Metadata } from "next";
import { OnboardingStep } from "@/components/journey/Onboarding";
import { PageHeader } from "@/components/journey/NextStep";
import { Simulator } from "@/components/sim/Simulator";

export const metadata: Metadata = { title: "Simulator" };

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader
        step={<OnboardingStep n={4} />}
        title="Simulator: nominal vs. putere de cumpărare"
        lead="Schimbă ipotezele și compară câți lei ai avea cu ce ai putea cumpăra cu ei, la prețurile de azi."
      />
      <Simulator />
    </div>
  );
}
