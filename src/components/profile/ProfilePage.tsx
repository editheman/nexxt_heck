"use client";

import { PageSkeleton } from "@/components/ui/Skeleton";
import { useDemoState } from "@/lib/useDemoState";
import { useNewsletter } from "@/lib/useNewsletter";
import { OnboardingWizard } from "./OnboardingWizard";

export function ProfilePage() {
  const { state, hydrated } = useDemoState();
  const { subscriber } = useNewsletter();
  if (!hydrated) return <PageSkeleton />;
  return <OnboardingWizard initial={state.profile} subscriber={subscriber} />;
}
