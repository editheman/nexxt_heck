import { OFFICIAL_SOURCES } from "@/content/sources";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-[1120px] gap-8 px-4 py-10 text-sm text-ink-muted sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="space-y-3">
          <p className="font-heading font-semibold text-ink">Protejează ce ai construit</p>
          <p>
            Platformă educațională. Nu suntem bancă, broker sau consultant de investiții și nu oferim recomandări
            personalizate de cumpărare sau vânzare. Calculele sunt estimări bazate pe ipotezele pe care le vezi și le
            poți modifica — nu sunt prognoze și nu garantează rezultate.
          </p>
          <p>
            Datele introduse rămân doar în browserul tău (localStorage). Nu cerem CNP, IBAN, date de card sau parole.
          </p>
        </div>
        <div className="space-y-3">
          <p className="font-semibold text-ink">Verifică informațiile la surse oficiale</p>
          <ul className="space-y-1.5">
            {OFFICIAL_SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary-hover">
                  {s.name}
                </a>{" "}
                — {s.topic}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
