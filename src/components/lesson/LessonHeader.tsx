import type { Lesson } from "@/lib/types";

interface LessonHeaderProps {
  lesson: Lesson;
}

function LessonHeader({ lesson }: LessonHeaderProps) {
  return (
    <header className="flex flex-col gap-3" data-testid="lesson-header">
      <span
        className="inline-flex w-fit items-center rounded-full bg-brand-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand"
        data-testid="lesson-header-badge"
      >
        Lesson {lesson.number} of 10
      </span>

      <h1 className="text-3xl font-bold text-foreground" data-testid="lesson-header-title">
        {lesson.subtitle}
      </h1>

      <p className="text-gray-500" data-testid="lesson-header-subtitle">
        {lesson.title}
      </p>
    </header>
  );
}

export { LessonHeader };
export type { LessonHeaderProps };
