import Link from "next/link";
import type { Lesson } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface LessonCardProps {
  lesson: Lesson;
}

function LessonCard({ lesson }: LessonCardProps) {
  const badgeVariant = lesson.isPublished ? "default" : "gray";
  const content = (
    <Card
      className="relative flex h-full flex-col gap-4 transition-shadow hover:shadow-md"
      data-testid={`lesson-card-${lesson.slug}`}
    >
      {!lesson.isPublished && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70"
          data-testid="lesson-card-overlay"
        >
          <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500">
            Coming soon
          </span>
        </div>
      )}

      <Badge variant={badgeVariant}>
        Lesson {lesson.number} of 10
      </Badge>

      <h3 className="text-lg font-semibold text-foreground" data-testid="lesson-card-title">
        {lesson.subtitle}
      </h3>

      <p className="line-clamp-2 text-sm text-gray-500" data-testid="lesson-card-description">
        {lesson.description}
      </p>

      <div className="mt-auto flex flex-col gap-2">
        <ProgressBar value={0} size="sm" />
        <span className="text-xs text-gray-400" data-testid="lesson-card-status">
          Not started
        </span>
      </div>
    </Card>
  );

  if (!lesson.isPublished) {
    return content;
  }

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 rounded-xl"
      data-testid={`lesson-card-link-${lesson.slug}`}
    >
      {content}
    </Link>
  );
}

export { LessonCard };
export type { LessonCardProps };
