import Link from "next/link";
import { OFFICIAL_SOURCES } from "@/content/sources";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-primary-soft/60">
      <div className="mx-auto max-w-[1120px] space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-2">
            <p className="flex items-center gap-2 font-bold text-ink">
              <Logo size={28} />
              Protejează ce ai construit
            </p>
            <p className="text-sm text-ink-muted">Platformă educațională pentru decizii financiare informate.</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 pt-2 text-sm">
              <li>
                <Link href="/confidentialitate" className="font-semibold text-ink hover:text-primary">Confidențialitate</Link>
              </li>
              <li>
                <Link href="/dezabonare" className="font-semibold text-ink hover:text-primary">Dezabonare</Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-ink">Verifică informațiile la surse oficiale</p>
            <ul className="space-y-1.5 text-sm text-ink-muted">
              {OFFICIAL_SOURCES.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2 hover:text-primary-hover">
                    {s.name}
                  </a>{" "}
                  — {s.topic}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[80ch] font-mono text-xs leading-relaxed text-ink-muted">
            Disclaimer: platformă exclusiv educațională. Nu suntem bancă, broker sau consultant de investiții și nu oferim
            recomandări personalizate. Calculele sunt estimări bazate pe ipotezele afișate — nu prognoze și nu garanții.
            Datele introduse rămân doar în browserul tău (localStorage); nu cerem CNP, IBAN, date de card sau parole.
          </p>
          <p className="flex shrink-0 items-center gap-2 font-mono text-xs text-ink-muted">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" /> Zero date personale solicitate
          </p>
        </div>
      </div>
    </footer>
  );
}
