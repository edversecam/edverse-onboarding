"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { SaveButton } from "@/components/author/SaveButton";
import { cn } from "@/lib/utils";
import {
  addLesson,
  addModule,
  deleteLesson,
  deleteModule,
  patchCourse,
  patchModule,
  reorderLesson,
  reorderModule,
  useCourse,
  useCoursesLoaded,
} from "@/lib/store";
import { useAdminOnly } from "@/lib/auth";

export default function CourseEditor() {
  useAdminOnly();
  const { courseId } = useParams<{ courseId: string }>();
  const course = useCourse(courseId);
  const loaded = useCoursesLoaded();
  const router = useRouter();

  const [dragModule, setDragModule] = useState<string | null>(null);
  const [dragLesson, setDragLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  if (!loaded)
    return <div className="grid min-h-dvh place-items-center text-muted">Loading…</div>;
  if (!course)
    return (
      <div className="grid min-h-dvh place-items-center text-muted">
        Course not found ·{" "}
        <Link href="/author" className="ml-1 underline">
          back
        </Link>
      </div>
    );

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <Logo showWordmark={false} href="/author" />
            <span className="text-sm text-muted">Course editor</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/learn/${course.id}`}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-2"
            >
              Preview
            </Link>
            <SaveButton courseId={course.id} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Course meta */}
        <section className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 font-display text-lg font-semibold">Course details</h2>
          <div className="grid gap-4">
            <Field label="Title">
              <input
                value={course.title}
                onChange={(e) => patchCourse(course.id, { title: e.target.value })}
                className="input"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Subtitle">
                <input
                  value={course.subtitle ?? ""}
                  onChange={(e) => patchCourse(course.id, { subtitle: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Audience">
                <input
                  value={course.audience ?? ""}
                  onChange={(e) => patchCourse(course.id, { audience: e.target.value })}
                  className="input"
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                value={course.description ?? ""}
                onChange={(e) =>
                  patchCourse(course.id, { description: e.target.value })
                }
                rows={2}
                className="input"
              />
            </Field>
          </div>
        </section>

        {/* Modules */}
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Modules & lessons</h2>
            <button
              type="button"
              onClick={() => addModule(course.id)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold transition hover:bg-surface-2"
            >
              + Module
            </button>
          </div>

          <div className="space-y-4">
            {course.modules.map((m) => (
              <div
                key={m.id}
                data-card-id={m.id}
                onDragOver={(e) => {
                  if (dragModule && dragModule !== m.id) {
                    e.preventDefault();
                    setOverId(m.id);
                  }
                }}
                onDragLeave={() => setOverId((o) => (o === m.id ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragModule && dragModule !== m.id)
                    reorderModule(course.id, dragModule, m.id);
                  setOverId(null);
                }}
                className={cn(
                  "rounded-xl border bg-surface p-4 shadow-[var(--shadow-card)] transition",
                  dragModule === m.id && "opacity-50",
                  overId === m.id && dragModule ? "border-brand" : "border-border"
                )}
              >
                <div className="flex items-center gap-2">
                  <DragHandle
                    label="Drag to reorder module"
                    onDragStart={(e) => {
                      setDragModule(m.id);
                      const card = e.currentTarget.closest("[data-card-id]");
                      if (card) e.dataTransfer.setDragImage(card, 16, 16);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      setDragModule(null);
                      setOverId(null);
                    }}
                  />
                  <input
                    value={m.title}
                    onChange={(e) =>
                      patchModule(course.id, m.id, { title: e.target.value })
                    }
                    className="input flex-1 font-semibold"
                  />
                  <IconBtn
                    label="Delete module"
                    danger
                    onClick={() =>
                      confirm("Delete this module and its lessons?") &&
                      deleteModule(course.id, m.id)
                    }
                  >
                    ✕
                  </IconBtn>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {m.lessons.map((l, li) => (
                    <li
                      key={l.id}
                      data-card-id={l.id}
                      onDragOver={(e) => {
                        if (
                          dragLesson &&
                          dragLesson.moduleId === m.id &&
                          dragLesson.lessonId !== l.id
                        ) {
                          e.preventDefault();
                          setOverId(l.id);
                        }
                      }}
                      onDragLeave={() => setOverId((o) => (o === l.id ? null : o))}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (
                          dragLesson &&
                          dragLesson.moduleId === m.id &&
                          dragLesson.lessonId !== l.id
                        )
                          reorderLesson(course.id, m.id, dragLesson.lessonId, l.id);
                        setOverId(null);
                      }}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 transition",
                        dragLesson?.lessonId === l.id && "opacity-50",
                        overId === l.id && dragLesson ? "border-brand" : "border-border"
                      )}
                    >
                      <DragHandle
                        label="Drag to reorder lesson"
                        small
                        onDragStart={(e) => {
                          setDragLesson({ moduleId: m.id, lessonId: l.id });
                          const row = e.currentTarget.closest("[data-card-id]");
                          if (row) e.dataTransfer.setDragImage(row, 16, 16);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          setDragLesson(null);
                          setOverId(null);
                        }}
                      />
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-tint text-xs font-bold text-brand-700">
                        {li + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/author/${course.id}/${l.id}`)
                        }
                        className="flex-1 truncate text-left text-sm font-medium hover:text-brand-700"
                      >
                        {l.title}
                        <span className="ml-2 text-xs text-muted">
                          {l.blocks.length} blocks
                        </span>
                      </button>
                      <IconBtn
                        label="Edit lesson"
                        onClick={() => router.push(`/author/${course.id}/${l.id}`)}
                      >
                        ✎
                      </IconBtn>
                      <IconBtn
                        label="Delete lesson"
                        danger
                        onClick={() =>
                          confirm("Delete this lesson?") &&
                          deleteLesson(course.id, l.id)
                        }
                      >
                        ✕
                      </IconBtn>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => addLesson(course.id, m.id)}
                  className="mt-3 rounded-lg border border-dashed border-border px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-surface-2"
                >
                  + Lesson
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function DragHandle({
  label,
  small,
  onDragStart,
  onDragEnd,
}: {
  label: string;
  small?: boolean;
  onDragStart: (e: React.DragEvent<HTMLSpanElement>) => void;
  onDragEnd: () => void;
}) {
  return (
    <span
      draggable
      aria-label={label}
      title="Drag to reorder"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "grid shrink-0 cursor-grab place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-foreground active:cursor-grabbing",
        small ? "h-7 w-6" : "h-8 w-7"
      )}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
        <circle cx="5" cy="4" r="1.3" />
        <circle cx="11" cy="4" r="1.3" />
        <circle cx="5" cy="8" r="1.3" />
        <circle cx="11" cy="8" r="1.3" />
        <circle cx="5" cy="12" r="1.3" />
        <circle cx="11" cy="12" r="1.3" />
      </svg>
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
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
