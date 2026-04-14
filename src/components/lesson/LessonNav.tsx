import Link from "next/link";
import type { Lesson } from "@/lib/types";
import { LESSONS } from "@/lib/constants";

interface LessonNavProps {
  currentLesson: Lesson;
}

function LessonNav({ currentLesson }: LessonNavProps) {
  const currentIndex = LESSONS.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? LESSONS[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < LESSONS.length - 1 ? LESSONS[currentIndex + 1] : null;

  return (
    <nav
      className="flex items-center justify-between gap-4"
      data-testid="lesson-nav"
    >
      <div className="flex-1">
        {prevLesson && (
          <Link
            href={`/lessons/${prevLesson.slug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            data-testid="lesson-nav-prev"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Lesson {prevLesson.number}
          </Link>
        )}
      </div>

      <div className="flex flex-1 justify-end">
        {nextLesson && (
          <Link
            href={`/lessons/${nextLesson.slug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            data-testid="lesson-nav-next"
          >
            Lesson {nextLesson.number}
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        )}
      </div>
    </nav>
  );
}

export { LessonNav };
export type { LessonNavProps };
