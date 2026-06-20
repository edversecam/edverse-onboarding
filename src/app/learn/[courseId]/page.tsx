import { notFound } from "next/navigation";
import { CoursePlayer } from "@/components/learn/CoursePlayer";
import { courses, getCourse } from "@/data/courses";

export function generateStaticParams() {
  return courses.map((c) => ({ courseId: c.id }));
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();
  return <CoursePlayer course={course} />;
}
