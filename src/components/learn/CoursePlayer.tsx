"use client";

import { useEffect, useMemo, useState } from "react";
import { Course, flattenLessons } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Sidebar } from "./Sidebar";

export function CoursePlayer({ course }: { course: Course }) {
  const flat = useMemo(() => flattenLessons(course), [course]);
  const storageKey = `edverse:progress:${course.id}`;

  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // Restore progress + last position.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as { done: string[]; index: number };
        setCompleted(new Set(saved.done ?? []));
        if (typeof saved.index === "number") setIndex(saved.index);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [storageKey]);

  // Persist.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify({ done: [...completed], index })
    );
  }, [completed, index, hydrated, storageKey]);

  const current = flat[index];
  const isFirst = index === 0;
  const isLast = index === flat.length - 1;

  const markDone = (lessonId: string) =>
    setCompleted((prev) => new Set(prev).add(lessonId));

  const goTo = (i: number) => {
    setIndex(i);
    setOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const next = () => {
    markDone(current.lesson.id);
    if (!isLast) goTo(index + 1);
  };
  const prev = () => !isFirst && goTo(index - 1);

  const courseDone = completed.size === flat.length;

  return (
    <div className="flex min-h-dvh">
      <Sidebar
        course={course}
        flat={flat}
        currentIndex={index}
        completed={completed}
        open={open}
        onPick={goTo}
        onClose={() => setOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-foreground hover:bg-surface-2"
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <div className="min-w-0">
            <p className="truncate text-xs text-muted">{current.moduleTitle}</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {current.lesson.title}
            </p>
          </div>
          <span className="ml-auto rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted">
            {index + 1} / {flat.length}
          </span>
        </header>

        {/* Content */}
        <main className="scroll-slim flex-1 overflow-y-auto">
          <article className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
            <div className="mb-6">
              <p className="text-sm font-semibold text-brand-700">
                {current.moduleTitle}
              </p>
              <h1 className="font-display text-3xl font-semibold text-foreground">
                {current.lesson.title}
              </h1>
              {current.lesson.summary && (
                <p className="mt-2 text-muted">{current.lesson.summary}</p>
              )}
            </div>

            <div className="space-y-8">
              {current.lesson.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </div>

            {/* Nav */}
            <div className="mt-12 flex items-center justify-between gap-3 border-t border-border pt-6">
              <button
                type="button"
                onClick={prev}
                disabled={isFirst}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Arrow dir="left" />
                Previous
              </button>

              {courseDone && isLast ? (
                <span className="inline-flex items-center gap-2 rounded-lg bg-success-tint px-4 py-2.5 text-sm font-semibold text-success">
                  Course complete 🎉
                </span>
              ) : (
                <button
                  type="button"
                  onClick={next}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition",
                    "bg-brand hover:bg-brand-600"
                  )}
                >
                  {isLast ? "Finish" : "Next"}
                  {!isLast && <Arrow dir="right" />}
                </button>
              )}
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4", dir === "left" && "rotate-180")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
