"use client";

import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { actions } from "@/lib/useDemoState";
import { newsletter } from "@/lib/useNewsletter";

export function ResetDemo() {
  const ref = useRef<HTMLDialogElement>(null);
  const [done, setDone] = useState(false);
  return (
    <div className="space-y-3">
      <Button variant="secondary" onClick={() => ref.current?.showModal()}>
        <Trash2 aria-hidden className="size-4" /> Resetează demo-ul
      </Button>
      {done && (
        <Alert tone="success" role="status" title="Demo resetat">
          Profilul, progresul și datele de abonare au fost șterse din acest browser.
        </Alert>
      )}
      <dialog
        ref={ref}
        aria-labelledby="reset-title"
        className="m-auto w-[min(92vw,440px)] rounded-[var(--radius-card)] bg-surface p-6 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <h2 id="reset-title" className="text-xl font-semibold">
          Ștergi tot progresul?
        </h2>
        <p className="mt-2 text-ink-muted">
          Se vor șterge profilul, ipotezele, progresul, articolele citite și, dacă există, adresa de e-mail și istoricul acordului salvate în acest browser. Acțiunea nu poate fi anulată.
        </p>
        <form method="dialog" className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="submit" variant="secondary" autoFocus>
            Anulează
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              actions.reset();
              newsletter.clearAll();
              ref.current?.close();
              setDone(true);
            }}
          >
            Da, șterge
          </Button>
        </form>
      </dialog>
    </div>
  );
}
