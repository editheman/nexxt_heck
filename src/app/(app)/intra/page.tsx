import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = { title: "Intră în cont" };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[480px] space-y-6">
      <header className="space-y-2 text-center">
        <Eyebrow center dot>Contul tău</Eyebrow>
        <h1 className="text-3xl text-ink">Intră în cont</h1>
      </header>
      <LoginForm />
    </div>
  );
}
