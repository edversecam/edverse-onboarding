import { LearnClient } from "@/components/learn/LearnClient";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <LearnClient courseId={courseId} />;
}
