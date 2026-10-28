export type QuizOption = { id: string; text: string; explanation: string };

export type Question = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctId: string;
  /** Section of the module to re-read when this question is missed. */
  sectionId: string;
};

export type ModuleSection = { id: string; title: string; body: string[] };

export type LearningModule = {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  sections: ModuleSection[];
  takeaways: string[];
  /** Optional link to an interactive tool that illustrates the module. */
  tool?: { href: string; label: string };
  quiz: Question[];
};
