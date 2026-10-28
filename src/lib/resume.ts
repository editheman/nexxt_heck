import type { DemoState } from "./storage";

/** Where a user should land: the portal once profiling is done, otherwise the first unfinished step. */
export function resumeHref(s: DemoState): string {
  if (s.onboarding.completedAt) return "/portal";
  if (!s.profile) return "/profil";
  if (!s.progress.visited.reality) return "/reality-check";
  return "/simulator";
}
