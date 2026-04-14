import { redirect } from "next/navigation";
import { legacyCourse } from "@/lib/legacyCourse";

export default async function LegacyLessonHomeworkRedirect({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  redirect(`/courses/${legacyCourse.slug}/lessons/${lessonSlug}/homework`);
}
