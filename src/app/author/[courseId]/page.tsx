"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import {
  addLesson,
  addModule,
  deleteLesson,
  deleteModule,
  moveLesson,
  moveModule,
  patchCourse,
  patchModule,
  useCourse,
  useCoursesLoaded,
} from "@/lib/store";

export default function CourseEditor() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = useCourse(courseId);
  const loaded = useCoursesLoaded();
  const router = useRouter();

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
            <Link href="/author">
              <Logo showWordmark={false} />
            </Link>
            <span className="text-sm text-muted">Course editor</span>
          </div>
          <Link
            href={`/learn/${course.id}`}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Preview
          </Link>
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
            {course.modules.map((m, mi) => (
              <div
                key={m.id}
                className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={m.title}
                    onChange={(e) =>
                      patchModule(course.id, m.id, { title: e.target.value })
                    }
                    className="input flex-1 font-semibold"
                  />
                  <IconBtn label="Move up" onClick={() => moveModule(course.id, m.id, -1)} disabled={mi === 0}>
                    ▲
                  </IconBtn>
                  <IconBtn
                    label="Move down"
                    onClick={() => moveModule(course.id, m.id, 1)}
                    disabled={mi === course.modules.length - 1}
                  >
                    ▼
                  </IconBtn>
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
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                    >
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
                      <IconBtn label="Move up" onClick={() => moveLesson(course.id, m.id, l.id, -1)} disabled={li === 0}>
                        ▲
                      </IconBtn>
                      <IconBtn
                        label="Move down"
                        onClick={() => moveLesson(course.id, m.id, l.id, 1)}
                        disabled={li === m.lessons.length - 1}
                      >
                        ▼
                      </IconBtn>
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
