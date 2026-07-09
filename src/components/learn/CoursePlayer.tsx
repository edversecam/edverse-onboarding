"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Course, flattenLessons } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { RichContent } from "@/components/blocks/RichText";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRole } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import { Sidebar } from "./Sidebar";

export function CoursePlayer({ course }: { course: Course }) {
  const flat = useMemo(() => flattenLessons(course), [course]);
  const { ready, initial, persist } = useProgress(course.id);
  const isAdmin = useRole() === "admin";

  const [index, setIndex] = useState(0);
  // Open by default on desktop, closed on mobile. CoursePlayer only mounts
  // client-side (LearnClient gates on load), so reading matchMedia here is safe.
  const [open, setOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
  );
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [seeded, setSeeded] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // The main area is the scroll container, so reset it (not the window) on nav.
  const scrollToTop = () => mainRef.current?.scrollTo({ top: 0 });

  // Only collapse the drawer automatically on mobile; keep it open on desktop.
  const closeOnMobile = () => {
    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(min-width: 1024px)").matches
    ) {
      setOpen(false);
    }
  };

  // Seed local state from saved progress once it arrives.
  useEffect(() => {
    if (!ready || !initial || seeded) return;
    setCompleted(new Set(initial.done));
    setIndex(Math.min(initial.index, flat.length - 1));
    setSeeded(true);
  }, [ready, initial, seeded, flat.length]);

  const current = flat[index];
  const isFirst = index === 0;
  const isLast = index === flat.length - 1;

  const goTo = (i: number) => {
    setIndex(i);
    closeOnMobile();
    persist([...completed], i);
    scrollToTop();
  };

  const next = () => {
    const nextDone = new Set(completed).add(current.lesson.id);
    const nextIndex = isLast ? index : index + 1;
    setCompleted(nextDone);
    setIndex(nextIndex);
    closeOnMobile();
    persist([...nextDone], nextIndex);
    scrollToTop();
  };
  const prev = () => !isFirst && goTo(index - 1);

  const courseDone = completed.size === flat.length;

  return (
    <div className="flex h-dvh overflow-hidden">
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
          {isAdmin && (
            <Link
              href={`/author/${course.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Edit course</span>
            </Link>
          )}
          <ThemeToggle />
        </header>

        {/* Content */}
        <main ref={mainRef} className="scroll-slim flex-1 overflow-y-auto">
          <article className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
            <div className="mb-6">
              <p className="text-sm font-semibold text-brand-700">
                {current.moduleTitle}
              </p>
              <h1 className="font-display text-3xl font-semibold text-foreground">
                {current.lesson.title}
              </h1>
              {current.lesson.summary && (
                <RichContent text={current.lesson.summary} className="mt-2 text-muted" />
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
