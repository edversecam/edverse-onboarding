"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { AccountMenu } from "@/components/AccountMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  createCourse,
  deleteCourse,
  importStarterCourse,
  useCourses,
  useCoursesLoaded,
} from "@/lib/store";
import { flattenLessons } from "@/lib/types";

export default function AuthorDashboard() {
  const courses = useCourses();
  const loaded = useCoursesLoaded();
  const router = useRouter();

  const onCreate = () => {
    const c = createCourse();
    router.push(`/author/${c.id}`);
  };

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-2"
            >
              Learner view
            </Link>
            <button
              type="button"
              onClick={onCreate}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              + New course
            </button>
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Course authoring
        </h1>
        <p className="mt-1 text-muted">
          Build and edit onboarding courses. Changes save automatically.
        </p>

        <div className="mt-8 space-y-3">
          {courses.map((course) => {
            const lessons = flattenLessons(course);
            return (
              <div
                key={course.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-lg font-semibold text-foreground">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted">
                    {course.modules.length} modules · {lessons.length} lessons
                  </p>
                </div>
                <Link
                  href={`/learn/${course.id}`}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-2"
                >
                  Preview
                </Link>
                <Link
                  href={`/author/${course.id}`}
                  className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete “${course.title}”? This cannot be undone.`))
                      deleteCourse(course.id);
                  }}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger-tint"
                >
                  Delete
                </button>
              </div>
            );
          })}

          {!loaded && (
            <div className="h-20 animate-pulse rounded-xl border border-border bg-surface-2" />
          )}

          {loaded && courses.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="text-muted">No courses yet. Start from scratch or load the sample.</p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={onCreate}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  + New course
                </button>
                <button
                  onClick={() => importStarterCourse()}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-2"
                >
                  Import starter course
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
