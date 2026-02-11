import { readLessonContent } from "@/lib/content";
import type { Lesson } from "@/lib/types";

interface LessonContentProps {
  lesson: Lesson;
}

export async function LessonContent({ lesson }: LessonContentProps) {
  const content = await readLessonContent(lesson);

  if (!content) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <p className="text-center text-gray-500">Content coming soon.</p>
      </div>
    );
  }

  if (content.type === "pdf") {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <iframe
          src={`/api/lessons/${lesson.slug}/content`}
          className="h-[80vh] w-full"
          title={`Lesson ${lesson.number}: ${lesson.title}`}
        />
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: content.css }} />
      <div
        className="lesson-content"
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    </>
  );
}
