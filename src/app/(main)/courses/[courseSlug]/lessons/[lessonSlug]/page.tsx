import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourseBySlugOrId } from "@/lib/courseQueries";
import { cssBaseForCourse } from "@/lib/lessonCss";
import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonReadTracker } from "@/components/lesson/LessonReadTracker";
import { LessonGoals } from "@/components/lesson/LessonGoals";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { LessonNav } from "@/components/lesson/LessonNav";
import { VideoPlayer } from "@/components/lesson/VideoPlayer";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function CourseLessonPage({
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

  const lessons = course.lessons.filter((lesson) => lesson.isPublished);
  const lesson = lessons.find((item) => item.slug === lessonSlug);

  if (!lesson) {
    notFound();
  }

  const hasTasks = lesson.homework.some((section) => section.tasks.length > 0);

  // Scroll-to-end read tracking: only for authed users (this page early-returns
  // null for anon) reading an HTML lesson with actual content. PDF and empty
  // lessons do NOT mount the tracker.
  const trackRead =
    lesson.contentType === "html" && lesson.contentHtml.trim() !== "";

  return (
    <div className="space-y-8">
      <Link href={`/courses/${course.slug}`} className="text-sm font-medium text-brand hover:underline">
        &larr; Back to course
      </Link>

      <LessonHeader lesson={lesson} />
      <LessonGoals goals={lesson.learningGoals} />
      <VideoPlayer videoUrl={lesson.videoUrl} />
      <LessonContent lesson={lesson} cssBundle={cssBaseForCourse(course.slug)} />

      {trackRead && <LessonReadTracker lessonId={lesson.id} />}

      {hasTasks && (
        <div className="flex justify-center">
          <Link href={`/courses/${course.slug}/lessons/${lesson.slug}/homework`}>
            <Button variant="primary" size="lg">
              View Homework
            </Button>
          </Link>
        </div>
      )}

      <LessonNav currentLesson={lesson} lessons={lessons} />
    </div>
  );
}
