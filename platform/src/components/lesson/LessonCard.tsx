"use client";

import Link from "next/link";
import type { Lesson, LessonProgress } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface LessonCardProps {
  lesson: Lesson;
  lessonProgress?: LessonProgress | null;
}

export function LessonCard({ lesson, lessonProgress }: LessonCardProps) {
  const percentage =
    lessonProgress && lessonProgress.totalTasks > 0
      ? Math.round(
          (lessonProgress.completedTasks / lessonProgress.totalTasks) * 100,
        )
      : 0;

  const statusText =
    lessonProgress?.status === "completed"
      ? "Completed"
      : lessonProgress?.status === "in_progress"
        ? "In progress"
        : "Not started";

  const badgeVariant = lesson.isPublished ? "default" : "gray";

  const content = (
    <Card className="relative flex h-full flex-col gap-4 transition-shadow hover:shadow-md">
      {!lesson.isPublished && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
          <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500">
            Coming soon
          </span>
        </div>
      )}

      <Badge variant={badgeVariant}>Lesson {lesson.number} of 10</Badge>

      <h3 className="text-lg font-semibold text-foreground">
        {lesson.subtitle}
      </h3>

      <p className="line-clamp-2 text-sm text-gray-500">{lesson.description}</p>

      <div className="mt-auto flex flex-col gap-2">
        <ProgressBar value={percentage} size="sm" />
        <span className="text-xs text-gray-400">{statusText}</span>
      </div>
    </Card>
  );

  if (!lesson.isPublished) return content;

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
}
