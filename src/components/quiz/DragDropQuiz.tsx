"use client";

import { useMemo, useState } from "react";
import { DragDropQuiz as DragDropQuizT } from "@/lib/types";
import { cn, seededShuffle } from "@/lib/utils";
import { QuizShell, QuizStatus } from "./QuizShell";

const BANK = "__bank__";

export function DragDropQuiz({
  quiz,
  onResult,
}: {
  quiz: DragDropQuizT;
  onResult?: (s: QuizStatus) => void;
}) {
  const bankOrder = useMemo(
    () => seededShuffle(quiz.items.map((i) => i.id), quiz.id),
    [quiz.items, quiz.id]
  );
  const [placement, setPlacement] = useState<Record<string, string>>(() =>
    Object.fromEntries(quiz.items.map((i) => [i.id, BANK]))
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizStatus>("idle");

  const itemText = (id: string) => quiz.items.find((i) => i.id === id)!.text;
  const place = (itemId: string, zone: string) => {
    if (status !== "idle") return;
    setPlacement((p) => ({ ...p, [itemId]: zone }));
    setSelected(null);
  };

  const bankItems = bankOrder.filter((id) => placement[id] === BANK);
  const allPlaced = bankItems.length === 0;

  const check = () => {
    const ok = quiz.items.every((i) => placement[i.id] === i.zoneId);
    const s: QuizStatus = ok ? "correct" : "incorrect";
    setStatus(s);
    onResult?.(s);
  };

  const isItemCorrect = (id: string) =>
    placement[id] === quiz.items.find((i) => i.id === id)!.zoneId;

  return (
    <QuizShell
      kind={quiz.kind}
      prompt={quiz.prompt}
      hint={quiz.hint ?? "Drag each item into the right group (or tap an item, then tap a group)."}
      status={status}
      canCheck={allPlaced}
      onCheck={check}
      onReset={() => {
        setStatus("idle");
        setSelected(null);
        setPlacement(Object.fromEntries(quiz.items.map((i) => [i.id, BANK])));
      }}
      feedbackCorrect={quiz.feedbackCorrect}
      feedbackIncorrect={quiz.feedbackIncorrect}
    >
      {/* Item bank */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => selected && place(selected, BANK)}
        className="mb-4 min-h-[3.5rem] rounded-lg border border-dashed border-border bg-surface-2 p-2"
      >
        <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Items
        </p>
        <div className="flex flex-wrap gap-2">
          {bankItems.length === 0 && (
            <span className="px-1 py-2 text-xs text-muted">All placed ✓</span>
          )}
          {bankItems.map((id) => (
            <Chip
              key={id}
              id={id}
              text={itemText(id)}
              selected={selected === id}
              onSelect={() => setSelected(selected === id ? null : id)}
              onDragStart={() => setSelected(id)}
              draggable
            />
          ))}
        </div>
      </div>

      {/* Zones */}
      <div className="grid gap-3 sm:grid-cols-2">
        {quiz.zones.map((zone) => {
          const items = quiz.items
            .map((i) => i.id)
            .filter((id) => placement[id] === zone.id);
          return (
            <div
              key={zone.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => selected && place(selected, zone.id)}
              onClick={() => selected && place(selected, zone.id)}
              className={cn(
                "rounded-lg border-2 border-dashed p-3 transition",
                selected
                  ? "cursor-pointer border-brand bg-brand-tint/40"
                  : "border-border bg-surface"
              )}
            >
              <p className="mb-2 text-sm font-semibold text-foreground">
                {zone.label}
              </p>
              <div className="flex min-h-[2.5rem] flex-wrap gap-2">
                {items.map((id) => (
                  <Chip
                    key={id}
                    id={id}
                    text={itemText(id)}
                    draggable={status === "idle"}
                    onSelect={() => status === "idle" && place(id, BANK)}
                    onDragStart={() => setSelected(id)}
                    state={
                      status === "idle"
                        ? "neutral"
                        : isItemCorrect(id)
                          ? "correct"
                          : "wrong"
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </QuizShell>
  );
}

function Chip({
  text,
  selected,
  state = "neutral",
  draggable,
  onSelect,
  onDragStart,
}: {
  id: string;
  text: string;
  selected?: boolean;
  state?: "neutral" | "correct" | "wrong";
  draggable?: boolean;
  onSelect?: () => void;
  onDragStart?: () => void;
}) {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition",
        state === "correct" && "border-success bg-success-tint text-success",
        state === "wrong" && "border-danger bg-danger-tint text-danger",
        state === "neutral" &&
          (selected
            ? "border-brand bg-brand text-white"
            : "border-border bg-surface hover:bg-surface-2"),
        draggable && "cursor-grab active:cursor-grabbing"
      )}
    >
      {text}
    </button>
  );
}
