import Link from "next/link";
import type { CourseProgressMetrics } from "@/lib/progressTracking";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface CourseProgressRowProps {
  progress: CourseProgressMetrics;
  courseTitle: string;
  courseSlug: string;
}

/**
 * Per-course progress row for the /progress page.
 *
 * Shows homework% as the HEADLINE metric (same number as the catalog card and
 * the CourseProgressHeader) and read% as a secondary bar. Both bars carry
 * distinct aria-labels with numeric values for screen-reader users.
 */
export function CourseProgressRow({
  progress,
  courseTitle,
  courseSlug,
}: CourseProgressRowProps) {
  return (
    <Link
      href={`/courses/${courseSlug}`}
      data-testid={`progress-course-row-${progress.courseId}`}
      className="block rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand/30 hover:bg-brand-light/30"
    >
      <div className="space-y-4">
        {/* Course title + total lesson count */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-gray-900">{courseTitle}</h3>
          <span className="shrink-0 whitespace-nowrap text-xs text-gray-500">
            {progress.totalLessons} lesson{progress.totalLessons === 1 ? "" : "s"}
          </span>
        </div>

        {/* Homework% — HEADLINE bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Homework</span>
            <span>{progress.homeworkPercent}%</span>
          </div>
          <ProgressBar
            value={progress.homeworkPercent}
            color="success"
            aria-label={`${courseTitle} homework ${progress.homeworkPercent}% complete`}
          />
        </div>

        {/* Read% — secondary bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Read</span>
            <span>{progress.readPercent}%</span>
          </div>
          <ProgressBar
            value={progress.readPercent}
            color="warning"
            size="sm"
            aria-label={`${courseTitle} read ${progress.readPercent}%`}
          />
        </div>

        {/* Lesson count sub-line */}
        <p className="text-xs text-gray-500">
          {progress.completedLessonCount} completed
          {" · "}
          {progress.readLessonCount} read
        </p>
      </div>
    </Link>
  );
}
