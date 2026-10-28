"use client";

import { Mail, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MODULE_SLUGS } from "@/content/moduleSlugs";
import { recordArticleOpen, shouldShowPrompt } from "@/lib/newsletter";
import { newsletter, useNewsletter } from "@/lib/useNewsletter";
import { DemoModeNote, NewsletterForm, SubscribedNote } from "./NewsletterForm";

/**
 * Placed at the end of an article. Records a local article-open event and,
 * when the frequency rules allow, shows an inline (never blocking) digest offer.
 */
export function ArticleEngagement({ slug }: { slug: string }) {
  const { hydrated } = useNewsletter();
  if (!hydrated) return null;
  return <Engagement key={slug} slug={slug} />;
}

type Phase = "hidden" | "offer" | "subscribed" | "later" | "declined";

function Engagement({ slug }: { slug: string }) {
  const snap = useNewsletter();
  // Decide once per article view, so the card doesn't vanish when its own impression is counted.
  const [phase, setPhase] = useState<Phase>(() =>
    shouldShowPrompt(
      { reading: recordArticleOpen(snap.reading, slug, MODULE_SLUGS), prompt: snap.prompt, subscribed: snap.subscriber !== null },
      new Date(),
    )
      ? "offer"
      : "hidden",
  );
  const [subscribedEmail, setSubscribedEmail] = useState("");
  const counted = useRef(false);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    newsletter.trackArticleOpen(slug);
    if (phase === "offer" && !counted.current) {
      counted.current = true;
      newsletter.recordImpression();
    }
    // Only on mount for this article view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const close = (next: "later" | "declined") => {
    if (next === "later") newsletter.dismiss();
    else newsletter.decline();
    setPhase(next);
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  if (phase === "hidden") return null;

  if (phase === "later" || phase === "declined") {
    return (
      <p ref={statusRef} tabIndex={-1} role="status" className="text-sm text-ink-muted outline-none">
        {phase === "later"
          ? "Am înțeles. Nu îți mai arătăm propunerea în următoarele săptămâni."
          : "Am înțeles. Nu îți mai arătăm această propunere. Te poți abona oricând din pagina Progres."}
      </p>
    );
  }

  return (
    <aside aria-labelledby="digest-title" data-testid="newsletter-prompt">
      <Card bar="gradient" className="space-y-5 p-6 pt-8 sm:p-8">
        {phase === "offer" && (
          <button
            type="button"
            onClick={() => close("later")}
            className="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            <X aria-hidden className="size-5" />
            <span className="sr-only">Închide — poate mai târziu</span>
          </button>
        )}
        <div className="flex items-start gap-4 pr-10">
          <span className="hidden size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-primary-soft text-primary sm:flex">
            <Mail aria-hidden className="size-5" />
          </span>
          <div className="space-y-2">
            <Eyebrow dot>Digest săptămânal · opțional</Eyebrow>
            <h2 id="digest-title" className="text-xl leading-snug text-ink sm:text-2xl">
              Ce s-a schimbat săptămâna aceasta pentru banii tăi
            </h2>
            <p className="text-ink-muted">
              O dată pe săptămână, un e-mail scurt cu cele mai importante noutăți economice din România — prețuri,
              dobânzi, taxe — și ce pot însemna concret pentru cheltuielile, creditele și economiile tale.
            </p>
          </div>
        </div>

        {phase === "subscribed" ? (
          <SubscribedNote email={subscribedEmail} />
        ) : (
          <>
            <NewsletterForm
              source="article-prompt"
              onSubscribed={(email) => {
                setSubscribedEmail(email);
                setPhase("subscribed");
              }}
              secondary={
                <Button variant="ghost" onClick={() => close("declined")}>
                  Nu, mulțumesc
                </Button>
              }
            />
            <p className="text-xs text-ink-muted">
              Poți citi în continuare fără să te abonezi. Îți cerem doar adresa de e-mail — nicio altă informație.
            </p>
            <DemoModeNote />
          </>
        )}
      </Card>
    </aside>
  );
}
