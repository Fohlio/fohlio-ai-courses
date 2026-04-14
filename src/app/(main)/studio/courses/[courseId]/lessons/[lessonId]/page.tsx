import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourseBySlugOrId } from "@/lib/courseQueries";
import { StudioLessonEditor } from "@/components/studio/StudioLessonEditor";

export const dynamic = "force-dynamic";

export default async function StudioLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { courseId, lessonId } = await params;
  const course = await getCourseBySlugOrId(courseId, {
    id: user.id,
    role: user.role,
  });

  if (!course || (course.owner.id !== user.id && user.role !== "admin")) {
    notFound();
  }

  const lesson = course.lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    notFound();
  }

  return <StudioLessonEditor course={course} initialLesson={lesson} />;
}
