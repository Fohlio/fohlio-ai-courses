import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourseBySlugOrId } from "@/lib/courseQueries";
import {
  getCourseProgress,
  getNextLessonAfter,
  isResumeTarget,
} from "@/lib/progressTracking";
import { HomeworkSection } from "@/components/homework/HomeworkSection";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

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

  // Server-side completion gate for the Continue button. This mirrors the
  // single completion rule in progressTracking (only REQUIRED tasks count):
  // a lesson with required tasks is complete once every one is submitted.
  const progress = await getCourseProgress(user.id, course.id);
  const status = progress.lessonStatusMap[lesson.id];
  const requiredComplete = Boolean(
    status &&
      status.requiredTaskCount > 0 &&
      status.submittedRequiredCount >= status.requiredTaskCount,
  );

  // Resolve the Continue target only when the gate is open (avoids the extra
  // catalog reads when there is nothing to advance to yet).
  const next = requiredComplete
    ? await getNextLessonAfter(user.id, course.id, lesson.id)
    : null;

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
        <p className="mt-1 text-gray-500">Homework for {course.title}</p>
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

      {requiredComplete && next && (
        <ContinuePanel
          next={next}
          currentCourseSlug={course.slug}
        />
      )}
    </div>
  );
}

/**
 * Bottom-of-page "Continue" panel, shown once all REQUIRED tasks for this
 * lesson are submitted. Targets the next incomplete lesson/course; when the
 * whole catalog is done it points to /progress instead.
 */
function ContinuePanel({
  next,
  currentCourseSlug,
}: {
  next: NonNullable<Awaited<ReturnType<typeof getNextLessonAfter>>>;
  currentCourseSlug: string;
}) {
  if (!isResumeTarget(next)) {
    // allCaughtUp — everything is done.
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-success/30 bg-success-light/50 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-success">
            <span aria-hidden>🎉</span> Required tasks complete
          </p>
          <p className="mt-1 text-sm text-gray-600">
            You&apos;ve finished every lesson. See how far you&apos;ve come.
          </p>
        </div>
        <Link href="/progress" className="shrink-0">
          <Button size="lg" variant="primary">
            All done — see your progress
          </Button>
        </Link>
      </div>
    );
  }

  const crossesCourse = next.courseSlug !== currentCourseSlug;

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand/30 bg-brand-light/50 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-lg font-bold text-brand">
          <span aria-hidden>✓</span> Required tasks complete
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {crossesCourse ? (
            <>
              Up next in{" "}
              <span className="font-medium text-gray-800">
                {next.courseTitle}
              </span>
              : {next.lessonTitle}
            </>
          ) : (
            <>
              Up next:{" "}
              <span className="font-medium text-gray-800">
                {next.lessonTitle}
              </span>
            </>
          )}
        </p>
      </div>
      <Link
        href={`/courses/${next.courseSlug}/lessons/${next.lessonSlug}`}
        className="shrink-0"
      >
        <Button size="lg" variant="primary">
          Continue &rarr;
        </Button>
      </Link>
    </div>
  );
}
