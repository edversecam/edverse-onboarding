"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { SaveButton } from "@/components/author/SaveButton";
import { BlockEditor } from "@/components/author/BlockEditor";
import { RichTextEditor } from "@/components/author/RichTextEditor";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { RichContent } from "@/components/blocks/RichText";
import { DragHandle, useSortable } from "@/components/author/Sortable";
import { cn } from "@/lib/utils";
import { BLOCK_LABELS, newBlock } from "@/lib/factories";
import { Block, BlockKind, blockQuizzes } from "@/lib/types";
import { patchLesson, setLessonBlocks, uid, useCourse, useCoursesLoaded } from "@/lib/store";
import { useAdminOnly } from "@/lib/auth";

export default function LessonEditor() {
  useAdminOnly();
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const course = useCourse(courseId);
  const loaded = useCoursesLoaded();
  const [open, setOpen] = useState<string | null>(null);

  // Drag-reorder blocks (hook must run before the early returns; reads the
  // latest blocks via a ref).
  const blocksRef = useRef<Block[]>([]);
  const blockSort = useSortable((draggedId, targetId) => {
    const arr = blocksRef.current;
    const from = arr.findIndex((b) => b.id === draggedId);
    const to = arr.findIndex((b) => b.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...arr];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLessonBlocks(courseId, lessonId, next);
  });

  if (!loaded)
    return <div className="grid min-h-dvh place-items-center text-muted">Loading…</div>;

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
  blocksRef.current = blocks;

  const updateBlock = (id: string, b: Block) =>
    setLessonBlocks(course.id, lesson.id, blocks.map((x) => (x.id === id ? b : x)));
  const removeBlock = (id: string) =>
    setLessonBlocks(course.id, lesson.id, blocks.filter((x) => x.id !== id));
  const addBlock = (kind: BlockKind) => {
    const b = newBlock(kind);
    setLessonBlocks(course.id, lesson.id, [...blocks, b]);
    setOpen(b.id);
  };
  const duplicateBlock = (i: number) => {
    const clone = structuredClone(blocks[i]);
    clone.id = uid("b"); // unique block id
    if (clone.kind === "knowledge-check") {
      clone.quizzes = blockQuizzes(clone).map((q) => ({ ...q, id: uid("q") }));
      clone.quiz = undefined;
    }
    const next = [...blocks];
    next.splice(i + 1, 0, clone); // insert right after the original
    setLessonBlocks(course.id, lesson.id, next);
    setOpen(clone.id);
  };

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Logo showWordmark={false} href={`/author/${course.id}`} />
            <div className="min-w-0">
              <p className="truncate text-xs text-muted">
                {course.title} · {mod.title}
              </p>
              <p className="truncate text-sm font-semibold">{lesson.title}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/learn/${course.id}`}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-2"
            >
              Preview course
            </Link>
            <SaveButton courseId={course.id} />
          </div>
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
              <RichTextEditor
                value={lesson.summary ?? ""}
                minRows={2}
                onChange={(html) => patchLesson(course.id, lesson.id, { summary: html })}
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
              <div
                key={b.id}
                {...blockSort.dropProps(b.id)}
                className={cn(
                  "rounded-xl border bg-surface shadow-[var(--shadow-card)] transition",
                  blockSort.isDragging(b.id) && "opacity-50",
                  blockSort.isOver(b.id) ? "border-brand" : "border-border"
                )}
              >
                <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                  <DragHandle label="Drag to reorder block" small {...blockSort.handleProps(b.id)} />
                  <span className="shrink-0 rounded-md bg-brand-tint px-2 py-0.5 text-xs font-semibold text-brand-700">
                    {BLOCK_LABELS[b.kind]}
                  </span>
                  <input
                    value={b.label ?? ""}
                    onChange={(e) => updateBlock(b.id, { ...b, label: e.target.value })}
                    placeholder={blockPlaceholder(b)}
                    aria-label="Block name"
                    className="min-w-0 flex-1 rounded-md bg-transparent px-1.5 py-1 text-sm font-medium text-foreground outline-none transition placeholder:font-normal placeholder:text-muted hover:bg-surface-2 focus:bg-surface-2"
                  />
                  <IconBtn
                    label={open === b.id ? "Collapse" : "Edit"}
                    onClick={() => setOpen(open === b.id ? null : b.id)}
                  >
                    {open === b.id ? <ChevronUpIcon /> : <PencilIcon />}
                  </IconBtn>
                  <IconBtn label="Duplicate" onClick={() => duplicateBlock(i)}>
                    <CopyIcon />
                  </IconBtn>
                  <IconBtn label="Delete" danger onClick={() => removeBlock(b.id)}>
                    <TrashIcon />
                  </IconBtn>
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
            {lesson.summary && (
              <RichContent text={lesson.summary} className="mt-1 text-muted" />
            )}
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

/** Suggested name shown when a block has no custom label yet. */
function blockPlaceholder(b: Block): string {
  if ("heading" in b && b.heading) return b.heading;
  if (b.kind === "callout" && b.title) return b.title;
  return "Name this block…";
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

const iconCls = "h-4 w-4";
function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" strokeLinecap="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
