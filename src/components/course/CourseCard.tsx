"use client";

import Link from "next/link";
import type { CourseCard as CourseCardType } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface CourseCardProps {
  course: CourseCardType;
  href?: string;
}

export function CourseCard({ course, href }: CourseCardProps) {
  const content = (
    <Card className="flex h-full flex-col gap-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge
            variant={
              course.status === "published"
                ? "success"
                : course.status === "archived"
                  ? "gray"
                  : "warning"
            }
          >
            {course.status}
          </Badge>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
            {course.subtitle && (
              <p className="mt-1 text-sm text-gray-500">{course.subtitle}</p>
            )}
          </div>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>By {course.owner.githubNickname}</p>
          <p>{course.publishedLessonCount} published lessons</p>
        </div>
      </div>

      <p className="line-clamp-3 text-sm text-gray-600">{course.description}</p>

      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{course.totalTasks} homework tasks</span>
          {course.progress && <span>{course.progress.completionPercentage}% complete</span>}
        </div>
        {course.progress && (
          <ProgressBar
            value={course.progress.completionPercentage}
            size="sm"
            color={
              course.progress.completionPercentage >= 80
                ? "success"
                : course.progress.completionPercentage > 0
                  ? "brand"
                  : "warning"
            }
          />
        )}
      </div>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
}
