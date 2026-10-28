"use client";

import { Button } from "@/components/ui/Button";

export default function Error({ retry }: { error: Error; retry: () => void }) {
  return (
    <div className="mx-auto max-w-[560px] space-y-4 py-12 text-center">
      <h1 className="text-3xl font-semibold text-primary">Ceva nu a funcționat</h1>
      <p className="text-ink-muted">A apărut o eroare neașteptată. Datele tale salvate nu au fost afectate.</p>
      <Button onClick={() => retry()}>Încearcă din nou</Button>
    </div>
  );
}
