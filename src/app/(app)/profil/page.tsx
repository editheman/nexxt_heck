import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile/ProfilePage";

export const metadata: Metadata = { title: "Profil financiar" };

export default function Page() {
  return (
    <div className="mx-auto max-w-[720px] space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">Pasul 1 din 5</p>
        <h1 className="text-3xl font-semibold text-primary sm:text-4xl">Profilul tău financiar</h1>
        <p className="text-lg text-ink-muted">
          Doar câteva cifre aproximative, ca să vezi exemple calculate pe situația ta. Durează sub două minute.
        </p>
      </header>
      <ProfilePage />
    </div>
  );
}
