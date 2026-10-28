import type { Metadata } from "next";
import { OnboardingStep } from "@/components/journey/Onboarding";
import { PageHeader } from "@/components/journey/NextStep";
import { TopicsPicker } from "@/components/interests/TopicsPicker";

export const metadata: Metadata = { title: "Ce vrei să înveți" };

export default function Page() {
  return (
    <div className="mx-auto max-w-[840px] space-y-8">
      <PageHeader
        step={<OnboardingStep n={3} />}
        title="Ce vrei să înveți?"
        lead="Alege una sau mai multe teme. Le salvăm în profilul tău și îți recomandăm modulele potrivite în portal."
      />
      <TopicsPicker />
    </div>
  );
}
