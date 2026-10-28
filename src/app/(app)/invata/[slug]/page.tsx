import { ArrowRight, Lightbulb } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MarkReadButton } from "@/components/learn/MarkReadButton";
import { ArticleEngagement } from "@/components/newsletter/ArticleEngagement";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { MODULES, getModule } from "@/content/modules";

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/invata/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getModule(slug)?.title ?? "Modul inexistent" };
}

export default function Page({ params }: PageProps<"/invata/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ModuleView params={params} />
    </Suspense>
  );
}

async function ModuleView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getModule(slug);
  if (!m) notFound();
  const index = MODULES.indexOf(m);

  return (
    <article className="mx-auto max-w-[720px] space-y-10">
      <header className="space-y-3">
        <Link href="/invata" className="text-sm font-semibold text-primary underline underline-offset-2">
          ← Toate modulele
        </Link>
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          Modulul {index + 1} din {MODULES.length} · {m.minutes} min
        </p>
        <h1 className="text-3xl font-semibold text-primary sm:text-4xl">{m.title}</h1>
        <p className="text-lg text-ink-muted">{m.summary}</p>
      </header>

      <nav aria-label="Cuprins" className="rounded-[var(--radius-card)] bg-surface-muted p-5">
        <p className="mb-2 font-semibold">Cuprins</p>
        <ol className="list-decimal space-y-1 pl-5">
          {m.sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-primary underline underline-offset-2">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {m.sections.map((s) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="module-section scroll-mt-24 space-y-3 rounded-[var(--radius-card)]">
          <h2 id={`${s.id}-title`} className="text-2xl font-semibold">
            {s.title}
          </h2>
          {s.body.map((para, i) => (
            <p key={i} className="text-[1.0625rem] leading-relaxed">
              {para}
            </p>
          ))}
        </section>
      ))}

      <Card className="space-y-3 bg-accent-soft shadow-none">
        <p className="flex items-center gap-2 font-semibold text-accent">
          <Lightbulb aria-hidden className="size-5" /> De reținut
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {m.takeaways.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <MarkReadButton slug={m.slug} />
        {m.tool && (
          <ButtonLink href={m.tool.href} variant="secondary">
            {m.tool.label} <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        )}
      </div>

      <ArticleEngagement slug={m.slug} />
    </article>
  );
}
