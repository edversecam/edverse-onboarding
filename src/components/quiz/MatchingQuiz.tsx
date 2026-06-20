"use client";

import { useMemo, useState } from "react";
import { MatchingQuiz as MatchingQuizT } from "@/lib/types";
import { cn, seededShuffle } from "@/lib/utils";
import { QuizShell, QuizStatus } from "./QuizShell";

export function MatchingQuiz({
  quiz,
  onResult,
}: {
  quiz: MatchingQuizT;
  onResult?: (s: QuizStatus) => void;
}) {
  const rightOptions = useMemo(
    () => seededShuffle(quiz.pairs.map((p) => p.right), quiz.id),
    [quiz.pairs, quiz.id]
  );
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<QuizStatus>("idle");

  const allPicked = quiz.pairs.every((p) => picked[p.id]);

  const check = () => {
    const ok = quiz.pairs.every((p) => picked[p.id] === p.right);
    const s: QuizStatus = ok ? "correct" : "incorrect";
    setStatus(s);
    onResult?.(s);
  };

  return (
    <QuizShell
      kind={quiz.kind}
      prompt={quiz.prompt}
      hint={quiz.hint ?? "Choose the matching answer for each item."}
      status={status}
      canCheck={allPicked}
      onCheck={check}
      onReset={() => {
        setStatus("idle");
        setPicked({});
      }}
      feedbackCorrect={quiz.feedbackCorrect}
      feedbackIncorrect={quiz.feedbackIncorrect}
    >
      <div className="space-y-2">
        {quiz.pairs.map((p) => {
          const reveal = status !== "idle";
          const correct = picked[p.id] === p.right;
          return (
            <div
              key={p.id}
              className={cn(
                "flex flex-col gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:items-center",
                reveal
                  ? correct
                    ? "border-success bg-success-tint"
                    : "border-danger bg-danger-tint"
                  : "border-border bg-surface"
              )}
            >
              <span className="flex-1 text-sm font-medium">{p.left}</span>
              <span className="hidden text-muted sm:inline">→</span>
              <select
                disabled={reveal}
                value={picked[p.id] ?? ""}
                onChange={(e) =>
                  setPicked((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand sm:w-56"
              >
                <option value="" disabled>
                  Choose…
                </option>
                {rightOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {reveal && !correct && (
                <span className="text-xs font-medium text-danger">
                  Answer: {p.right}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </QuizShell>
  );
}
