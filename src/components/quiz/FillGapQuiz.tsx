"use client";

import { useMemo, useState } from "react";
import { FillGapQuiz as FillGapQuizT } from "@/lib/types";
import { cn, seededShuffle } from "@/lib/utils";
import { QuizShell, QuizStatus } from "./QuizShell";

export function FillGapQuiz({
  quiz,
  onResult,
}: {
  quiz: FillGapQuizT;
  onResult?: (s: FillGapStatus) => void;
}) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<QuizStatus>("idle");

  // Split "Sentence with {{1}} and {{2}}." into text + blank tokens. A token
  // that has no matching blank (e.g. the author removed it) renders as plain
  // text rather than crashing.
  const blanks = quiz.blanks ?? [];
  const segments = useMemo(() => {
    const parts = (quiz.text ?? "").split(/\{\{(\d+)\}\}/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        const blank = blanks[Number(part) - 1];
        return blank
          ? { type: "blank" as const, blank }
          : { type: "text" as const, text: `{{${part}}}` };
      }
      return { type: "text" as const, text: part };
    });
  }, [quiz.text, blanks]);

  const optionsFor = (blankId: string, answer: string, extra?: string[]) =>
    seededShuffle([answer, ...(extra ?? [])], quiz.id + blankId);

  const allPicked = blanks.length > 0 && blanks.every((b) => picked[b.id]);

  const check = () => {
    const ok =
      blanks.length > 0 &&
      blanks.every((b) => picked[b.id]?.toLowerCase() === b.answer.toLowerCase());
    const s: QuizStatus = ok ? "correct" : "incorrect";
    setStatus(s);
    onResult?.(s);
  };

  return (
    <QuizShell
      kind={quiz.kind}
      prompt={quiz.prompt}
      hint={quiz.hint ?? "Pick the word that fits each gap."}
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
      <p className="text-base leading-9 text-foreground">
        {segments.map((seg, i) => {
          if (seg.type === "text") return <span key={i}>{seg.text}</span>;
          const b = seg.blank;
          const reveal = status !== "idle";
          const correct = picked[b.id]?.toLowerCase() === b.answer.toLowerCase();
          return (
            <select
              key={i}
              disabled={reveal}
              value={picked[b.id] ?? ""}
              onChange={(e) =>
                setPicked((prev) => ({ ...prev, [b.id]: e.target.value }))
              }
              className={cn(
                "mx-1 rounded-md border px-2 py-1 text-sm font-medium outline-none transition",
                reveal
                  ? correct
                    ? "border-success bg-success-tint text-success"
                    : "border-danger bg-danger-tint text-danger"
                  : "border-brand/40 bg-brand-tint text-brand-700 focus:border-brand"
              )}
            >
              <option value="" disabled>
                ▾ choose
              </option>
              {optionsFor(b.id, b.answer, b.options).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          );
        })}
      </p>
      {status === "incorrect" && (
        <p className="mt-3 text-xs text-muted">
          Correct answers:{" "}
          {blanks.map((b) => b.answer).join(", ")}
        </p>
      )}
    </QuizShell>
  );
}

type FillGapStatus = QuizStatus;
