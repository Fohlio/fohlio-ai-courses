import Link from "next/link";
import type { CourseDetail } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface CourseLessonListProps {
  course: CourseDetail;
  editable?: boolean;
}

export function CourseLessonList({
  course,
  editable = false,
}: CourseLessonListProps) {
  return (
    <div className="space-y-4">
      {course.lessons.map((lesson) => {
        const lessonHref = editable
          ? `/studio/courses/${course.id}/lessons/${lesson.id}`
          : `/courses/${course.slug}/lessons/${lesson.slug}`;

        return (
          <Link
            key={lesson.id}
            href={lessonHref}
            data-testid={`course-lesson-link-${lesson.id}`}
          >
            <Card className="transition-colors hover:border-brand/30">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="gray">Lesson {lesson.number}</Badge>
                    {!lesson.isPublished && <Badge variant="warning">Hidden</Badge>}
                  </div>
                  <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                  {lesson.subtitle && (
                    <p className="text-sm text-gray-500">{lesson.subtitle}</p>
                  )}
                  <p className="text-sm text-gray-600">{lesson.description || "No description yet."}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>{lesson.homework.flatMap((section) => section.tasks).length} tasks</p>
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
