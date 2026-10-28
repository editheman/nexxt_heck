"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { maskEmail } from "@/lib/newsletter";
import { useNewsletter } from "@/lib/useNewsletter";
import { DemoModeNote, NewsletterForm, SubscribedNote } from "./NewsletterForm";

/** Progres → "Datele tale": always-available way to subscribe or unsubscribe, independent of the article prompt. */
export function NewsletterSettings() {
  const { subscriber, hydrated } = useNewsletter();
  const [justSubscribed, setJustSubscribed] = useState<string | null>(null);
  if (!hydrated) return null;

  return (
    <Card className="space-y-4" data-testid="newsletter-settings">
      <h3 className="text-lg text-ink">Digestul săptămânal pe e-mail</h3>
      {justSubscribed ? (
        <SubscribedNote email={justSubscribed} />
      ) : subscriber ? (
        <p className="text-ink-muted">
          Ești abonat cu <strong className="text-ink">{maskEmail(subscriber.email)}</strong> (mod demo).{" "}
          <Link href="/dezabonare" className="font-semibold text-primary underline underline-offset-2">
            Dezabonează-te
          </Link>
        </p>
      ) : (
        <>
          <p className="text-ink-muted">Nu ești abonat. Abonarea este opțională și nu influențează nimic din aplicație.</p>
          <NewsletterForm source="progress-page" onSubscribed={setJustSubscribed} />
          <DemoModeNote />
        </>
      )}
    </Card>
  );
}
