"use client";

import { Course, FlatLesson } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

export function Sidebar({
  course,
  flat,
  currentIndex,
  completed,
  open,
  onPick,
  onClose,
}: {
  course: Course;
  flat: FlatLesson[];
  currentIndex: number;
  completed: Set<string>;
  open: boolean;
  onPick: (index: number) => void;
  onClose: () => void;
}) {
  const pct = Math.round((completed.size / flat.length) * 100);

  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed z-40 flex h-dvh w-[300px] flex-col border-r border-border bg-surface transition-transform duration-300 lg:static lg:h-dvh lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 lg:hidden"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Course header + progress */}
        <div className="border-b border-border px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {course.audience ?? "Onboarding"}
          </p>
          <h2 className="font-display text-lg font-semibold leading-tight text-foreground">
            {course.title}
          </h2>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-muted">{pct}%</span>
          </div>
        </div>

        {/* Module / lesson tree */}
        <nav className="scroll-slim flex-1 overflow-y-auto px-3 py-3">
          {course.modules.map((m, mi) => (
            <div key={m.id} className="mb-4">
              <p className="px-2 pb-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                {m.title}
              </p>
              <ul className="space-y-0.5">
                {m.lessons.map((lesson) => {
                  const item = flat.find((f) => f.lesson.id === lesson.id)!;
                  const isCurrent = item.index === currentIndex;
                  const isDone = completed.has(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        onClick={() => onPick(item.index)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition",
                          isCurrent
                            ? "bg-brand-tint font-semibold text-brand-700"
                            : "text-foreground hover:bg-surface-2"
                        )}
                      >
                        <StatusDot done={isDone} current={isCurrent} />
                        <span className="flex-1 leading-snug">{lesson.title}</span>
                        {lesson.durationMin && (
                          <span className="text-[11px] text-muted">
                            {lesson.durationMin}m
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {mi < course.modules.length - 1 && null}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

function StatusDot({ done, current }: { done: boolean; current: boolean }) {
  if (done) {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success text-white">
        <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
          <path d="M8 13.2 4.8 10l-1.3 1.3L8 15.8l8-8-1.3-1.3z" />
        </svg>
      </span>
    );
  }
  return (
    <span
      className={cn(
        "h-5 w-5 shrink-0 rounded-full border-2",
        current ? "border-brand" : "border-border"
      )}
    />
  );
}
