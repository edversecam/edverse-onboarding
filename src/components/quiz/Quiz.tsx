"use client";

import { Quiz as QuizT } from "@/lib/types";
import { QuizStatus } from "./QuizShell";
import { MultipleAnswer, MultipleChoice, TrueFalse } from "./ChoiceQuizzes";
import { OrderingQuiz } from "./OrderingQuiz";
import { DragDropQuiz } from "./DragDropQuiz";
import { MatchingQuiz } from "./MatchingQuiz";
import { FillGapQuiz } from "./FillGapQuiz";

export function Quiz({
  quiz,
  onResult,
}: {
  quiz: QuizT;
  onResult?: (status: QuizStatus) => void;
}) {
  switch (quiz.kind) {
    case "multiple-choice":
      return <MultipleChoice quiz={quiz} onResult={onResult} />;
    case "multiple-answer":
      return <MultipleAnswer quiz={quiz} onResult={onResult} />;
    case "true-false":
      return <TrueFalse quiz={quiz} onResult={onResult} />;
    case "ordering":
      return <OrderingQuiz quiz={quiz} onResult={onResult} />;
    case "drag-drop":
      return <DragDropQuiz quiz={quiz} onResult={onResult} />;
    case "matching":
      return <MatchingQuiz quiz={quiz} onResult={onResult} />;
    case "fill-gap":
      return <FillGapQuiz quiz={quiz} onResult={onResult} />;
    default:
      return null;
  }
}
