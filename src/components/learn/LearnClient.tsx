"use client";

import Link from "next/link";
import { useCourse, useCoursesLoaded } from "@/lib/store";
import { CoursePlayer } from "./CoursePlayer";

export function LearnClient({ courseId }: { courseId: string }) {
  const course = useCourse(courseId);
  const loaded = useCoursesLoaded();

  if (!loaded) {
    return (
      <div className="grid min-h-dvh place-items-center text-muted">
        Loading…
      </div>
    );
  }

  if (!course) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="text-center">
          <p className="font-display text-2xl font-semibold">Course not found</p>
          <Link href="/" className="mt-3 inline-block text-brand-700 underline">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  return <CoursePlayer course={course} />;
}
