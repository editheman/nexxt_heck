import type { Metadata } from "next";
import { PortalBackLink } from "@/components/journey/Onboarding";
import { PageHeader } from "@/components/journey/NextStep";
import { MyMethods } from "@/components/methods/MyMethods";

export const metadata: Metadata = { title: "Metodele mele" };

export default function Page() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-8">
      <PageHeader
        step={<PortalBackLink />}
        title="Metodele mele"
        lead="Metodele alese din recomandări. Confirmă-le pe cele pe care le folosești — așa îți construim profilul, iar când te schimbi, istoricul rămâne."
      />
      <MyMethods />
    </div>
  );
}
