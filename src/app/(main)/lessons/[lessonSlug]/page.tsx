import { notFound } from "next/navigation";
import Link from "next/link";
import { getLessonBySlug } from "@/lib/constants";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { LessonGoals } from "@/components/lesson/LessonGoals";
import { VideoPlayer } from "@/components/lesson/VideoPlayer";
import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonNav } from "@/components/lesson/LessonNav";
import { Button } from "@/components/ui/Button";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  const lesson = getLessonBySlug(lessonSlug);

  if (!lesson) {
    notFound();
  }

  const hasTasks = lesson.homework.some((s) => s.tasks.length > 0);

  return (
    <div className="space-y-8">
      <LessonHeader lesson={lesson} />
      <LessonGoals goals={lesson.learningGoals} />
      <VideoPlayer videoUrl={lesson.videoUrl} />

      <LessonContent lesson={lesson} />

      {hasTasks && (
        <div className="flex justify-center">
          <Link href={`/lessons/${lesson.slug}/homework`}>
            <Button variant="primary" size="lg">
              View Homework
            </Button>
          </Link>
        </div>
      )}

      <LessonNav currentLesson={lesson} />
    </div>
  );
}
