import { notFound } from "next/navigation";
import Link from "next/link";
import { getLessonBySlug, getAllHomeworkTasks } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HomeworkSection } from "@/components/homework/HomeworkSection";

export default async function HomeworkPage({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  const lesson = getLessonBySlug(lessonSlug);

  if (!lesson) {
    notFound();
  }

  const allTasks = getAllHomeworkTasks(lesson);
  const hasHomework = allTasks.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/lessons/${lesson.slug}`}
          className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to lesson
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Homework &mdash; {lesson.subtitle}
          </h1>
          <Badge variant="default">{allTasks.length} tasks</Badge>
        </div>
      </div>

      {!hasHomework ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">No homework for this lesson yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {lesson.homework.map((section) => (
            <HomeworkSection key={section.id} section={section} lessonId={lesson.id} />
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <Link href={`/lessons/${lesson.slug}`}>
          <Button variant="secondary">Back to Lesson</Button>
        </Link>
      </div>
    </div>
  );
}
