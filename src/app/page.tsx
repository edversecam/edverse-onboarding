"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/brand/Logo";
import { AccountMenu } from "@/components/AccountMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { revalidateCourses, useCourses, useCoursesLoaded } from "@/lib/store";
import { useRole, useUser } from "@/lib/auth";
import { flattenLessons } from "@/lib/types";

export default function Home() {
  const courses = useCourses();
  const loaded = useCoursesLoaded();
  const user = useUser();
  const role = useRole();
  const isAdmin = role === "admin";

  // Always refresh the list on entry so newly created courses appear.
  useEffect(() => {
    revalidateCourses();
  }, []);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/author"
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-2"
              >
                Author courses
              </Link>
            )}
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-brand-tint/60 to-background">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-brand-700">
            New Hire Onboarding
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Welcome to the team. Let&apos;s get you started.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            Short, interactive lessons that take you from day one to confident
            and connected — at your own pace.
          </p>
        </div>
      </section>

      {/* Course list */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-5 font-display text-2xl font-semibold text-foreground">
          Your courses
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {courses.map((course) => {
            const lessons = flattenLessons(course);
            return (
              <Link
                key={course.id}
                href={`/learn/${course.id}`}
                className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-brand/40"
              >
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-tint text-brand-700">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                    <path d="M12 3 1 8l11 5 9-4.09V15h2V8L12 3zM5 13.18V17c0 1.66 3.13 3 7 3s7-1.34 7-3v-3.82l-7 3.18-7-3.18z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {course.audience}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
                  {course.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted">
                  {course.description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs font-medium text-muted">
                  <span>{course.modules.length} modules</span>
                  <span>·</span>
                  <span>{lessons.length} lessons</span>
                  <span className="ml-auto font-semibold text-brand-700 group-hover:underline">
                    Begin →
                  </span>
                </div>
              </Link>
            );
          })}
          {!loaded && (
            <div className="h-44 animate-pulse rounded-2xl border border-border bg-surface-2" />
          )}
        </div>

        {loaded && courses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            {isAdmin ? (
              <p className="text-muted">
                No courses published yet.{" "}
                <Link href="/author" className="font-semibold text-brand-700 underline">
                  Create one in the author studio
                </Link>
                .
              </p>
            ) : user ? (
              <p className="text-muted">No onboarding courses assigned to you yet.</p>
            ) : (
              <p className="text-muted">
                <Link href="/login" className="font-semibold text-brand-700 underline">
                  Sign in
                </Link>{" "}
                to see your assigned onboarding courses.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
