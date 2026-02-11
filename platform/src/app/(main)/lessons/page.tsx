"use client";

import { LESSONS } from "@/lib/constants";
import { LessonCard } from "@/components/lesson/LessonCard";
import { useProgress } from "@/hooks/useProgress";

export default function LessonsPage() {
  const { progress } = useProgress();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
        <p className="mt-1 text-gray-500">
          Track your progress through the Fohlio Tech Course
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {LESSONS.map((lesson) => {
          const lp = progress?.lessonProgress.find(
            (p) => p.lessonId === lesson.id,
          );
          return (
            <LessonCard key={lesson.id} lesson={lesson} lessonProgress={lp} />
          );
        })}
      </div>
    </div>
  );
}
