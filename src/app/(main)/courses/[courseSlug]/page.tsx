import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourseBySlugOrId } from "@/lib/courseQueries";
import { CourseLessonList } from "@/components/course/CourseLessonList";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { courseSlug } = await params;
  const course = await getCourseBySlugOrId(courseSlug, {
    id: user.id,
    role: user.role,
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="success">{course.status}</Badge>
          <span className="text-sm text-gray-400">
            By {course.owner.githubNickname}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          {course.subtitle && (
            <p className="mt-2 text-lg text-gray-500">{course.subtitle}</p>
          )}
        </div>
        <p className="max-w-3xl text-sm leading-7 text-gray-600">
          {course.description}
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Lessons</h2>
            <p className="text-sm text-gray-500">
              Open any published lesson to read the material and complete homework.
            </p>
          </div>
          <p className="text-sm text-gray-400">
            {course.lessons.length} lesson{course.lessons.length === 1 ? "" : "s"}
          </p>
        </div>

        <CourseLessonList course={course} />
      </section>
    </div>
  );
}
