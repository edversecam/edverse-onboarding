"use client";

import { useState } from "react";
import {
  MultipleAnswerQuiz,
  MultipleChoiceQuiz,
  TrueFalseQuiz,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { QuizShell, QuizStatus } from "./QuizShell";

function optionClass(
  status: QuizStatus,
  selected: boolean,
  correct: boolean
): string {
  if (status === "idle") {
    return selected
      ? "border-brand bg-brand-tint"
      : "border-border bg-surface hover:bg-surface-2";
  }
  if (correct) return "border-success bg-success-tint";
  if (selected && !correct) return "border-danger bg-danger-tint";
  return "border-border bg-surface opacity-70";
}

export function MultipleChoice({
  quiz,
  onResult,
}: {
  quiz: MultipleChoiceQuiz;
  onResult?: (s: QuizStatus) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizStatus>("idle");

  const check = () => {
    const opt = quiz.options.find((o) => o.id === selected);
    const s: QuizStatus = opt?.correct ? "correct" : "incorrect";
    setStatus(s);
    onResult?.(s);
  };

  return (
    <QuizShell
      kind={quiz.kind}
      prompt={quiz.prompt}
      hint={quiz.hint}
      status={status}
      canCheck={selected !== null}
      onCheck={check}
      onReset={() => {
        setStatus("idle");
        setSelected(null);
      }}
      feedbackCorrect={quiz.feedbackCorrect}
      feedbackIncorrect={quiz.feedbackIncorrect}
    >
      <div className="space-y-2">
        {quiz.options.map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={status !== "idle"}
            onClick={() => setSelected(o.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition",
              optionClass(status, selected === o.id, !!o.correct)
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full border",
                selected === o.id ? "border-brand" : "border-border"
              )}
            >
              {selected === o.id && (
                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
              )}
            </span>
            {o.text}
          </button>
        ))}
      </div>
    </QuizShell>
  );
}

export function MultipleAnswer({
  quiz,
  onResult,
}: {
  quiz: MultipleAnswerQuiz;
  onResult?: (s: QuizStatus) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<QuizStatus>("idle");

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const check = () => {
    const correctIds = new Set(
      quiz.options.filter((o) => o.correct).map((o) => o.id)
    );
    const ok =
      correctIds.size === selected.size &&
      [...selected].every((id) => correctIds.has(id));
    const s: QuizStatus = ok ? "correct" : "incorrect";
    setStatus(s);
    onResult?.(s);
  };

  return (
    <QuizShell
      kind={quiz.kind}
      prompt={quiz.prompt}
      hint={quiz.hint ?? "Select every correct answer."}
      status={status}
      canCheck={selected.size > 0}
      onCheck={check}
      onReset={() => {
        setStatus("idle");
        setSelected(new Set());
      }}
      feedbackCorrect={quiz.feedbackCorrect}
      feedbackIncorrect={quiz.feedbackIncorrect}
    >
      <div className="space-y-2">
        {quiz.options.map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={status !== "idle"}
            onClick={() => toggle(o.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition",
              optionClass(status, selected.has(o.id), !!o.correct)
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-[6px] border",
                selected.has(o.id) ? "border-brand bg-brand text-white" : "border-border"
              )}
            >
              {selected.has(o.id) && (
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                  <path d="M8 13.2 4.8 10l-1.3 1.3L8 15.8l8-8-1.3-1.3z" />
                </svg>
              )}
            </span>
            {o.text}
          </button>
        ))}
      </div>
    </QuizShell>
  );
}

export function TrueFalse({
  quiz,
  onResult,
}: {
  quiz: TrueFalseQuiz;
  onResult?: (s: QuizStatus) => void;
}) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [status, setStatus] = useState<QuizStatus>("idle");

  const check = () => {
    const s: QuizStatus = selected === quiz.answer ? "correct" : "incorrect";
    setStatus(s);
    onResult?.(s);
  };

  return (
    <QuizShell
      kind={quiz.kind}
      prompt={quiz.prompt}
      hint={quiz.hint}
      status={status}
      canCheck={selected !== null}
      onCheck={check}
      onReset={() => {
        setStatus("idle");
        setSelected(null);
      }}
      feedbackCorrect={quiz.feedbackCorrect}
      feedbackIncorrect={quiz.feedbackIncorrect}
    >
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((val) => {
          const isSel = selected === val;
          const reveal = status !== "idle";
          const isCorrectChoice = val === quiz.answer;
          return (
            <button
              key={String(val)}
              type="button"
              disabled={reveal}
              onClick={() => setSelected(val)}
              className={cn(
                "rounded-lg border px-4 py-4 text-sm font-semibold transition",
                reveal
                  ? isCorrectChoice
                    ? "border-success bg-success-tint text-success"
                    : isSel
                      ? "border-danger bg-danger-tint text-danger"
                      : "border-border opacity-70"
                  : isSel
                    ? "border-brand bg-brand-tint text-brand-700"
                    : "border-border bg-surface hover:bg-surface-2"
              )}
            >
              {val ? "True" : "False"}
            </button>
          );
        })}
      </div>
    </QuizShell>
  );
}
