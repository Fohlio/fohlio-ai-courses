import { prepareLessonHtml } from "@/lib/lessonHtml";
import type { Lesson } from "@/lib/types";
import { LessonWidgets } from "./LessonWidgets";

interface LessonContentProps {
  lesson: Lesson;
  cssBundle?: string;
}

export async function LessonContent({ lesson, cssBundle }: LessonContentProps) {
  if (lesson.contentType === "pdf" && lesson.pdfUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <iframe
          src={lesson.pdfUrl}
          className="h-[80vh] w-full"
          title={`Lesson ${lesson.number}: ${lesson.title}`}
        />
      </div>
    );
  }

  if (!lesson.contentHtml.trim()) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <p className="text-center text-gray-500">Content coming soon.</p>
      </div>
    );
  }

  const content = prepareLessonHtml(lesson.contentHtml, lesson.assets, cssBundle);

  return (
    <>
      <div
        className="lesson-content"
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
      <LessonWidgets />
    </>
  );
}
