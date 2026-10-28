export type Gradable = { id: string; correctId: string };

export type QuizScore = { correct: number; total: number; wrongIds: string[] };

/** Unanswered questions count as wrong. wrongIds keep question order. */
export function scoreQuiz(questions: Gradable[], answers: Record<string, string>): QuizScore {
  const wrongIds = questions.filter((q) => answers[q.id] !== q.correctId).map((q) => q.id);
  return { correct: questions.length - wrongIds.length, total: questions.length, wrongIds };
}

export function questionsForRetry<Q extends Gradable>(questions: Q[], wrongIds: string[]): Q[] {
  const wrong = new Set(wrongIds);
  return questions.filter((q) => wrong.has(q.id));
}
