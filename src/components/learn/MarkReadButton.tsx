"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { actions } from "@/lib/useDemoState";

export function MarkReadButton({ slug }: { slug: string }) {
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        actions.markModuleRead(slug);
        router.push(`/invata/${slug}/quiz`);
      }}
    >
      Am citit — fac quiz-ul
    </Button>
  );
}
