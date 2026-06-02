import type { CourseProgressMetrics } from "@/lib/progressTracking";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface CourseProgressHeaderProps {
  progress: CourseProgressMetrics;
  courseTitle: string;
}

/**
 * Quiet, informational course-progress header showing TWO metrics:
 *   - homework% (headline) — the same number shown on catalog cards
 *   - read%     (secondary) — forward-only from launch
 *
 * Rendered ONLY for authenticated users (the caller guards this) so anonymous
 * visitors never see a fake "0 / N" pressure number.
 *
 * Both bars carry distinct aria-labels with numeric values.
 */
export function CourseProgressHeader({
  progress,
  courseTitle,
}: CourseProgressHeaderProps) {
  return (
    <section
      data-testid="course-progress-header"
      className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-900">Your progress</span>
        <span className="text-gray-500">
          {progress.completedLessonCount}/{progress.totalLessons} lessons
          {" · "}
          {progress.homeworkPercent}%
        </span>
      </div>

      {/* Homework% — HEADLINE bar (matches catalog card + /progress page) */}
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
    </section>
  );
}
