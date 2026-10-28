import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Quiz } from "@/components/quiz/Quiz";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { MODULES, getModule } from "@/content/modules";

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/invata/[slug]/quiz">): Promise<Metadata> {
  const { slug } = await params;
  const m = getModule(slug);
  return { title: m ? `Quiz: ${m.title}` : "Quiz inexistent" };
}

export default function Page({ params }: PageProps<"/invata/[slug]/quiz">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <QuizView params={params} />
    </Suspense>
  );
}

async function QuizView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getModule(slug);
  if (!m) notFound();
  const index = MODULES.indexOf(m);
  const nextHref = index + 1 < MODULES.length ? `/invata/${MODULES[index + 1].slug}` : "/progres";

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <header className="space-y-3">
        <Link href={`/invata/${m.slug}`} className="text-sm font-semibold text-primary underline underline-offset-2">
          ← Înapoi la modul
        </Link>
        <h1 className="text-3xl font-semibold text-primary">Quiz: {m.title}</h1>
        <p className="text-ink-muted">Primești o explicație după fiecare răspuns. Rezultatul cel mai bun se salvează.</p>
      </header>
      <Quiz module={m} nextHref={nextHref} />
    </div>
  );
}
