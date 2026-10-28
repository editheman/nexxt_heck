"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { maskEmail } from "@/lib/newsletter";
import { newsletter, useNewsletter } from "@/lib/useNewsletter";

export function UnsubscribePanel() {
  const { subscriber, hydrated } = useNewsletter();
  const [done, setDone] = useState(false);
  if (!hydrated) return <PageSkeleton />;

  if (done) {
    return (
      <Alert tone="success" role="status" title="Te-ai dezabonat">
        Am șters adresa de e-mail din acest browser și am notat retragerea acordului. Nu vei mai primi digestul.
      </Alert>
    );
  }

  if (!subscriber) {
    return (
      <Card className="space-y-2">
        <h2 className="text-xl text-ink">Nu există nicio abonare în acest browser</h2>
        <p className="text-ink-muted">Nu avem salvată nicio adresă de e-mail pentru digest, deci nu este nimic de anulat.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <h2 className="text-xl text-ink">Abonare activă (mod demo)</h2>
      <p className="text-ink-muted">
        Adresa <strong className="text-ink">{maskEmail(subscriber.email)}</strong> este abonată la digestul săptămânal.
        Dezabonarea șterge adresa și păstrează doar o notă (fără e-mail) că acordul a fost retras.
      </p>
      <Button
        variant="danger"
        onClick={() => {
          newsletter.unsubscribe("unsubscribe-page");
          setDone(true);
        }}
      >
        Dezabonează-mă
      </Button>
    </Card>
  );
}
