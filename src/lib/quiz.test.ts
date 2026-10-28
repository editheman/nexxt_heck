import { describe, expect, it } from "vitest";
import { questionsForRetry, scoreQuiz } from "./quiz";

const qs = [
  { id: "q1", correctId: "a" },
  { id: "q2", correctId: "b" },
  { id: "q3", correctId: "c" },
];

describe("scoreQuiz", () => {
  it("counts correct answers and lists wrong ids in question order", () => {
    expect(scoreQuiz(qs, { q3: "a", q1: "a", q2: "a" })).toEqual({ correct: 1, total: 3, wrongIds: ["q2", "q3"] });
  });

  it("treats unanswered questions as wrong", () => {
    expect(scoreQuiz(qs, {})).toEqual({ correct: 0, total: 3, wrongIds: ["q1", "q2", "q3"] });
  });
});

describe("questionsForRetry", () => {
  it("keeps only the missed questions, in original order", () => {
    expect(questionsForRetry(qs, ["q3", "q1"]).map((q) => q.id)).toEqual(["q1", "q3"]);
  });
});
