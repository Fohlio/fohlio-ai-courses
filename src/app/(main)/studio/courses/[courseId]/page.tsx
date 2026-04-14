import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourseBySlugOrId } from "@/lib/courseQueries";
import { StudioCourseEditor } from "@/components/studio/StudioCourseEditor";

export const dynamic = "force-dynamic";

export default async function StudioCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { courseId } = await params;
  const course = await getCourseBySlugOrId(courseId, {
    id: user.id,
    role: user.role,
  });

  if (!course || (course.owner.id !== user.id && user.role !== "admin")) {
    notFound();
  }

  return <StudioCourseEditor initialCourse={course} />;
}
