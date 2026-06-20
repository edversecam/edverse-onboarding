"use client";

import { useMemo, useState } from "react";
import { OrderingQuiz as OrderingQuizT } from "@/lib/types";
import { arraysEqual, cn, seededShuffle } from "@/lib/utils";
import { QuizShell, QuizStatus } from "./QuizShell";

export function OrderingQuiz({
  quiz,
  onResult,
}: {
  quiz: OrderingQuizT;
  onResult?: (s: QuizStatus) => void;
}) {
  const correctOrder = useMemo(() => quiz.items.map((i) => i.id), [quiz.items]);
  const initial = useMemo(
    () => seededShuffle(correctOrder, quiz.id),
    [correctOrder, quiz.id]
  );
  const [order, setOrder] = useState<string[]>(initial);
  const [status, setStatus] = useState<QuizStatus>("idle");
  const [dragId, setDragId] = useState<string | null>(null);

  const label = (id: string) => quiz.items.find((i) => i.id === id)!.text;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  };

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    setOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(dragId);
      const to = next.indexOf(targetId);
      next.splice(from, 1);
      next.splice(to, 0, dragId);
      return next;
    });
    setDragId(null);
  };

  const check = () => {
    const s: QuizStatus = arraysEqual(order, correctOrder) ? "correct" : "incorrect";
    setStatus(s);
    onResult?.(s);
  };

  return (
    <QuizShell
      kind={quiz.kind}
      prompt={quiz.prompt}
      hint={quiz.hint ?? "Drag the rows, or use the arrows, to arrange them."}
      status={status}
      canCheck
      onCheck={check}
      onReset={() => {
        setStatus("idle");
        setOrder(seededShuffle(correctOrder, quiz.id + "r"));
      }}
      feedbackCorrect={quiz.feedbackCorrect}
      feedbackIncorrect={quiz.feedbackIncorrect}
    >
      <ol className="space-y-2">
        {order.map((id, idx) => {
          const reveal = status !== "idle";
          const inPlace = reveal && correctOrder[idx] === id;
          return (
            <li
              key={id}
              draggable={!reveal}
              onDragStart={() => setDragId(id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-3 text-sm transition",
                reveal
                  ? inPlace
                    ? "border-success bg-success-tint"
                    : "border-danger bg-danger-tint"
                  : "cursor-grab border-border bg-surface hover:bg-surface-2 active:cursor-grabbing"
              )}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-tint text-xs font-bold text-brand-700">
                {idx + 1}
              </span>
              {!reveal && (
                <span className="text-muted" aria-hidden>
                  <DragDots />
                </span>
              )}
              <span className="flex-1">{label(id)}</span>
              {!reveal && (
                <span className="flex flex-col">
                  <button
                    type="button"
                    aria-label="Move up"
                    onClick={() => move(idx, idx - 1)}
                    className="px-1 text-muted hover:text-brand"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    onClick={() => move(idx, idx + 1)}
                    className="px-1 text-muted hover:text-brand"
                  >
                    ▼
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </QuizShell>
  );
}

function DragDots() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
      <circle cx="5" cy="4" r="1.3" />
      <circle cx="11" cy="4" r="1.3" />
      <circle cx="5" cy="8" r="1.3" />
      <circle cx="11" cy="8" r="1.3" />
      <circle cx="5" cy="12" r="1.3" />
      <circle cx="11" cy="12" r="1.3" />
    </svg>
  );
}
