"use client";

import { Badge } from "@/components/ui/Badge";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useDemoState } from "@/lib/useDemoState";
import { ProfileForm } from "./ProfileForm";
import { UseDemoProfileButton } from "./UseDemoProfileButton";

export function ProfilePage() {
  const { state, hydrated } = useDemoState();
  if (!hydrated) return <PageSkeleton />;
  return (
    <div className="space-y-6">
      {state.profile?.isDemo && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <Badge kind="fictional" /> Acum folosești profilul exemplu. Completează formularul pentru a-l înlocui cu datele tale.
        </p>
      )}
      <ProfileForm initial={state.profile} />
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
        <span>Vrei doar să explorezi?</span>
        <UseDemoProfileButton variant="ghost" />
      </div>
    </div>
  );
}
