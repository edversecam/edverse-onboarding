"use client";

import { cn } from "@/lib/utils";

export type QuizStatus = "idle" | "correct" | "incorrect";

const KIND_LABEL: Record<string, string> = {
  "multiple-choice": "Multiple choice",
  "multiple-answer": "Select all that apply",
  "true-false": "True or false",
  ordering: "Put in order",
  "drag-drop": "Drag into groups",
  matching: "Match the pairs",
  "fill-gap": "Fill the gap",
};

export function QuizShell({
  kind,
  prompt,
  hint,
  status,
  canCheck,
  onCheck,
  onReset,
  feedbackCorrect,
  feedbackIncorrect,
  children,
}: {
  kind: string;
  prompt: string;
  hint?: string;
  status: QuizStatus;
  canCheck: boolean;
  onCheck: () => void;
  onReset: () => void;
  feedbackCorrect?: string;
  feedbackIncorrect?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
        <CheckBadge />
        {KIND_LABEL[kind] ?? "Knowledge check"}
      </div>

      <p className="text-base font-medium text-foreground sm:text-lg">{prompt}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}

      <div className="mt-4">{children}</div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {status === "idle" ? (
          <button
            type="button"
            onClick={onCheck}
            disabled={!canCheck}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Check answer
          </button>
        ) : (
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-2"
          >
            Try again
          </button>
        )}

        {status !== "idle" && (
          <Feedback
            status={status}
            message={
              status === "correct"
                ? feedbackCorrect ?? "Correct — nicely done."
                : feedbackIncorrect ?? "Not quite. Review and try again."
            }
          />
        )}
      </div>
    </div>
  );
}

function Feedback({ status, message }: { status: QuizStatus; message: string }) {
  const correct = status === "correct";
  return (
    <div
      role="status"
      className={cn(
        "animate-pop inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
        correct
          ? "bg-success-tint text-success"
          : "bg-danger-tint text-danger"
      )}
    >
      {correct ? <IconCheck /> : <IconX />}
      <span>{message}</span>
    </div>
  );
}

function CheckBadge() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M6.5 11 3 7.5l1-1 2.5 2.5L11.5 4l1 1z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
      <path d="M8 13.2 4.8 10l-1.3 1.3L8 15.8l8-8-1.3-1.3z" />
    </svg>
  );
}
function IconX() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
      <path d="m10 8.6 3.5-3.5 1.4 1.4L11.4 10l3.5 3.5-1.4 1.4L10 11.4l-3.5 3.5-1.4-1.4L8.6 10 5.1 6.5l1.4-1.4z" />
    </svg>
  );
}
