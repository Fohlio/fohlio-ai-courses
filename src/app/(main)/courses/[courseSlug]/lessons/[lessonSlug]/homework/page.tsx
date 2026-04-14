import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourseBySlugOrId } from "@/lib/courseQueries";
import { HomeworkSection } from "@/components/homework/HomeworkSection";

export default async function LessonHomeworkPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { courseSlug, lessonSlug } = await params;
  const course = await getCourseBySlugOrId(courseSlug, {
    id: user.id,
    role: user.role,
  });

  if (!course) {
    notFound();
  }

  const lesson = course.lessons
    .filter((item) => item.isPublished)
    .find((item) => item.slug === lessonSlug);

  if (!lesson) {
    notFound();
  }

  const allTasks = lesson.homework.flatMap((section) => section.tasks);

  return (
    <div className="space-y-8">
      <Link
        href={`/courses/${course.slug}/lessons/${lesson.slug}`}
        className="text-sm font-medium text-brand hover:underline"
      >
        &larr; Back to lesson
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
        <p className="mt-1 text-gray-500">
          Homework for {course.title}
        </p>
      </div>

      {allTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No homework for this lesson yet.
        </div>
      ) : (
        <div className="space-y-8">
          {lesson.homework.map((section) => (
            <HomeworkSection
              key={section.id}
              section={section}
              courseId={course.id}
              lessonId={lesson.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
