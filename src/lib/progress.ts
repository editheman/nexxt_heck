import type { DemoState } from "./storage";

export type JourneyItem = { id: string; label: string; href: string; done: boolean };

export type ProgressSummary = {
  journey: JourneyItem[];
  modulesRead: number;
  quizzesPassed: number;
  scamsDone: number;
  /** 0–100, share of all trackable items completed. */
  percent: number;
};

/** A quiz counts as passed at ≥ 75% correct (3 of 4). */
export const PASS_RATIO = 0.75;

export function isPassed(best: number, total: number) {
  return total > 0 && best / total >= PASS_RATIO;
}

export function computeProgress(
  state: DemoState,
  catalog: { moduleSlugs: string[]; scamIds: string[] },
): ProgressSummary {
  const p = state.progress;
  const modulesRead = catalog.moduleSlugs.filter((s) => p.modulesRead[s]).length;
  const quizzesPassed = catalog.moduleSlugs.filter((s) => {
    const q = p.quizzes[s];
    return q !== undefined && isPassed(q.best, q.total);
  }).length;
  const scamsDone = catalog.scamIds.filter((id) => p.scams[id]).length;

  const journey: JourneyItem[] = [
    { id: "profil", label: "Completează profilul financiar", href: "/profil", done: state.profile !== null },
    { id: "reality", label: "Vezi Reality Check", href: "/reality-check", done: Boolean(p.visited.reality) },
    { id: "simulator", label: "Explorează simulatorul", href: "/simulator", done: Boolean(p.visited.simulator) },
    { id: "fraude", label: "Parcurge un scenariu de fraudă", href: "/fraude", done: scamsDone > 0 },
    { id: "modul", label: "Citește un modul", href: "/invata", done: modulesRead > 0 },
    { id: "quiz", label: "Treci un quiz (minimum 75%)", href: "/invata", done: quizzesPassed > 0 },
  ];

  const total = journey.length + catalog.moduleSlugs.length * 2 + catalog.scamIds.length;
  const done = journey.filter((j) => j.done).length + modulesRead + quizzesPassed + scamsDone;
  return { journey, modulesRead, quizzesPassed, scamsDone, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
