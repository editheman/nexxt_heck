import type { Metadata } from "next";
import { PortalBackLink } from "@/components/journey/Onboarding";
import { PageHeader } from "@/components/journey/NextStep";
import { Recommendations } from "@/components/recommend/Recommendations";

export const metadata: Metadata = { title: "Recomandări" };

export default function Page() {
  return (
    <div className="mx-auto max-w-[880px] space-y-8">
      <PageHeader
        step={<PortalBackLink />}
        title="Ce te ajută să-ți păstrezi puterea de cumpărare"
        lead="Pe baza profilului tău și a patru răspunsuri scurte, îți arătăm în ce ordine merită să iei în calcul categoriile de produse — și de ce."
      />
      <Recommendations />
    </div>
  );
}
