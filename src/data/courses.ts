import { Course } from "@/lib/types";
import { sampleCourse } from "./sample-course";

/** Course registry. Phase 2 replaces this with Supabase queries. */
export const courses: Course[] = [sampleCourse];

export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}
