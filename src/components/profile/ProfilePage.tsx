"use client";

import { PageSkeleton } from "@/components/ui/Skeleton";
import { useDemoState } from "@/lib/useDemoState";
import { OnboardingWizard } from "./OnboardingWizard";

export function ProfilePage() {
  const { state, hydrated } = useDemoState();
  if (!hydrated) return <PageSkeleton />;
  return <OnboardingWizard initial={state.profile} />;
}
