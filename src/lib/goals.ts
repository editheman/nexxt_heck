import { GOAL_PATHS } from "@/content/goalPaths";
import { MODULES } from "@/content/modules";
import type { LearningModule } from "@/content/types";
import type { Goal } from "./storage";

/** The goal's modules, in learning-path order. */
export function modulesForGoal(goal: Goal): LearningModule[] {
  return GOAL_PATHS[goal].modules.map((slug) => MODULES.find((m) => m.slug === slug)).filter((m): m is LearningModule => m !== undefined);
}

/** Every module not in the goal's path, in catalogue order. */
export function otherModules(goal: Goal): LearningModule[] {
  const mine = new Set(GOAL_PATHS[goal].modules);
  return MODULES.filter((m) => !mine.has(m.slug));
}
