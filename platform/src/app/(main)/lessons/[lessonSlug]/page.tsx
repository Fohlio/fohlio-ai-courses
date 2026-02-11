import { notFound } from "next/navigation";
import Link from "next/link";
import { getLessonBySlug } from "@/lib/constants";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { LessonGoals } from "@/components/lesson/LessonGoals";
import { VideoPlayer } from "@/components/lesson/VideoPlayer";
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

      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <p className="text-gray-500">
          Lesson content will be loaded here. Source file:{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">
            {lesson.contentUrl || "Not available yet"}
          </code>
        </p>
      </div>

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
