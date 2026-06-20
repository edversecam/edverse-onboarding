"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { BlockEditor } from "@/components/author/BlockEditor";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { BLOCK_LABELS, newBlock } from "@/lib/factories";
import { Block, BlockKind } from "@/lib/types";
import { patchLesson, setLessonBlocks, useCourse } from "@/lib/store";

export default function LessonEditor() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const course = useCourse(courseId);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const found = course?.modules
    .flatMap((m) => m.lessons.map((l) => ({ m, l })))
    .find((x) => x.l.id === lessonId);

  if (!course || !found)
    return (
      <div className="grid min-h-dvh place-items-center text-muted">
        Lesson not found ·{" "}
        <Link href={`/author/${courseId}`} className="ml-1 underline">
          back
        </Link>
      </div>
    );

  const { l: lesson, m: mod } = found;
  const blocks = lesson.blocks;

  const updateBlock = (id: string, b: Block) =>
    setLessonBlocks(course.id, lesson.id, blocks.map((x) => (x.id === id ? b : x)));
  const removeBlock = (id: string) =>
    setLessonBlocks(course.id, lesson.id, blocks.filter((x) => x.id !== id));
  const moveBlock = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    setLessonBlocks(course.id, lesson.id, next);
  };
  const addBlock = (kind: BlockKind) => {
    const b = newBlock(kind);
    setLessonBlocks(course.id, lesson.id, [...blocks, b]);
    setOpen(b.id);
  };

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={`/author/${course.id}`}>
              <Logo showWordmark={false} />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted">
                {course.title} · {mod.title}
              </p>
              <p className="truncate text-sm font-semibold">{lesson.title}</p>
            </div>
          </div>
          <Link
            href={`/learn/${course.id}`}
            className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Preview course
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-2">
        {/* Editor column */}
        <div>
          <section className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Lesson title
                </span>
                <input
                  value={lesson.title}
                  onChange={(e) => patchLesson(course.id, lesson.id, { title: e.target.value })}
                  className="input"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Minutes
                </span>
                <input
                  type="number"
                  value={lesson.durationMin ?? ""}
                  onChange={(e) =>
                    patchLesson(course.id, lesson.id, {
                      durationMin: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="input sm:w-24"
                />
              </label>
            </div>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                Summary
              </span>
              <input
                value={lesson.summary ?? ""}
                onChange={(e) => patchLesson(course.id, lesson.id, { summary: e.target.value })}
                className="input"
              />
            </label>
          </section>

          {/* Block palette */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Add content block
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(BLOCK_LABELS) as BlockKind[]).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => addBlock(kind)}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium transition hover:border-brand/40 hover:bg-brand-tint"
                >
                  + {BLOCK_LABELS[kind]}
                </button>
              ))}
            </div>
          </div>

          {/* Block list */}
          <div className="mt-5 space-y-3">
            {blocks.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
                No blocks yet — add one above.
              </div>
            )}
            {blocks.map((b, i) => (
              <div key={b.id} className="rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                  <span className="rounded-md bg-brand-tint px-2 py-0.5 text-xs font-semibold text-brand-700">
                    {BLOCK_LABELS[b.kind]}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(open === b.id ? null : b.id)}
                    className="ml-auto text-sm font-medium text-muted hover:text-brand-700"
                  >
                    {open === b.id ? "Collapse" : "Edit"}
                  </button>
                  <IconBtn label="Up" onClick={() => moveBlock(i, -1)} disabled={i === 0}>▲</IconBtn>
                  <IconBtn label="Down" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1}>▼</IconBtn>
                  <IconBtn label="Delete" danger onClick={() => removeBlock(b.id)}>✕</IconBtn>
                </div>
                {open === b.id && (
                  <div className="p-4">
                    <BlockEditor block={b} onChange={(nb) => updateBlock(b.id, nb)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live preview column */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Live preview
          </p>
          <div className="rounded-2xl border border-border bg-background p-6 shadow-[var(--shadow-card)]">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              {lesson.title}
            </h1>
            {lesson.summary && <p className="mt-1 text-muted">{lesson.summary}</p>}
            <div className="mt-6 space-y-8">
              {blocks.map((b) => (
                <BlockRenderer key={b.id} block={b} />
              ))}
              {blocks.length === 0 && (
                <p className="text-sm text-muted">Your lesson preview appears here.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-sm transition hover:bg-surface-2 disabled:opacity-30 ${
        danger ? "text-danger hover:bg-danger-tint" : "text-muted"
      }`}
    >
      {children}
    </button>
  );
}
