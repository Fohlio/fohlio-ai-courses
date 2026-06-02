import Link from "next/link";
import type { CourseDetail } from "@/lib/types";
import type { LessonStatus } from "@/lib/progressTracking";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LessonStatusIcon } from "@/components/course/LessonStatusIcon";

interface CourseLessonListProps {
  course: CourseDetail;
  editable?: boolean;
  /**
   * Lesson-id → LessonStatus (completed + read + partial counts). Present only
   * for authenticated viewers; when omitted (anonymous, or not yet fetched) no
   * completion indicators are shown — no fake "not done" pressure.
   */
  lessonStatusMap?: Record<string, LessonStatus>;
}

export function CourseLessonList({
  course,
  editable = false,
  lessonStatusMap,
}: CourseLessonListProps) {
  // Status indicators render only when a map is supplied (authed, non-edit view).
  const hasStatus = !editable && lessonStatusMap !== undefined;

  return (
    <div className="space-y-4">
      {course.lessons.map((lesson) => {
        const lessonHref = editable
          ? `/studio/courses/${course.id}/lessons/${lesson.id}`
          : `/courses/${course.slug}/lessons/${lesson.slug}`;

        const status = lessonStatusMap?.[lesson.id];
        const completed = status?.completed ?? false;
        const read = status?.read ?? false;
        const submittedRequiredCount = status?.submittedRequiredCount ?? 0;
        const requiredTaskCount = status?.requiredTaskCount ?? 0;

        // "read but not completed" — surfaces the amber Read state/badge.
        const isReadOnly = read && !completed;
        // "partial homework" — read + some-but-not-all required tasks submitted.
        const isPartial =
          isReadOnly &&
          requiredTaskCount > 0 &&
          submittedRequiredCount > 0 &&
          submittedRequiredCount < requiredTaskCount;

        return (
          <Link
            key={lesson.id}
            href={lessonHref}
            data-testid={`course-lesson-link-${lesson.id}`}
          >
            <Card className="transition-colors hover:border-brand/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  {/* Status icon (shape-based, accessible). */}
                  {hasStatus && (
                    <span
                      className="mt-0.5 shrink-0"
                      data-testid={`lesson-completion-${lesson.id}`}
                    >
                      <LessonStatusIcon
                        completed={completed}
                        read={read}
                        lessonId={lesson.id}
                      />
                    </span>
                  )}
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="gray">Lesson {lesson.number}</Badge>
                      {hasStatus && completed && (
                        <Badge variant="success">Completed</Badge>
                      )}
                      {hasStatus && isReadOnly && (
                        <Badge variant="warning">Read</Badge>
                      )}
                      {!lesson.isPublished && (
                        <Badge variant="warning">Hidden</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                    {lesson.subtitle && (
                      <p className="text-sm text-gray-500">{lesson.subtitle}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {lesson.description || "No description yet."}
                    </p>
                    {/* Partial homework sub-label: "N/M tasks". */}
                    {isPartial && (
                      <p className="text-xs text-gray-400">
                        {submittedRequiredCount}/{requiredTaskCount} required tasks
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 whitespace-nowrap text-right text-xs text-gray-400">
                  <p>
                    {lesson.homework.flatMap((section) => section.tasks).length} tasks
                  </p>
                  <p>{lesson.learningGoals.length} goals</p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
