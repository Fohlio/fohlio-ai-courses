"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { CourseDetail, CourseStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CourseLessonList } from "@/components/course/CourseLessonList";

interface StudioCourseEditorProps {
  initialCourse: CourseDetail;
}

const STATUS_OPTIONS: CourseStatus[] = ["draft", "published", "archived"];

export function StudioCourseEditor({ initialCourse }: StudioCourseEditorProps) {
  const [course, setCourse] = useState(initialCourse);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof CourseDetail>(key: K, value: CourseDetail[K]) {
    setCourse((currentCourse) => ({ ...currentCourse, [key]: value }));
  }

  function handleSaveCourse() {
    startTransition(async () => {
      setError(null);

      const response = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: course.title,
          subtitle: course.subtitle,
          description: course.description,
          slug: course.slug,
          status: course.status,
          coverImageUrl: course.coverImageUrl,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save course.");
        return;
      }

      setCourse(data.data);
    });
  }

  function handleCreateLesson() {
    startTransition(async () => {
      setError(null);

      const response = await fetch(`/api/courses/${course.id}/lessons`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create lesson.");
        return;
      }

      const refreshedCourseResponse = await fetch(`/api/courses/${course.id}`);
      const refreshedCourse = await refreshedCourseResponse.json();

      if (!refreshedCourseResponse.ok) {
        setError(refreshedCourse.error || "Failed to reload course.");
        return;
      }

      setCourse(refreshedCourse.data);
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course constructor</h1>
            <p className="mt-1 text-sm text-gray-500">
              Build the course shell here, then open lessons for HTML, assets, and homework editing.
            </p>
          </div>
          <Link href={`/studio/courses/${course.id}/students`}>
            <Button variant="secondary">Review Learners</Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Course title"
            value={course.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
          <Input
            label="Slug"
            value={course.slug}
            onChange={(event) => updateField("slug", event.target.value)}
          />
          <Input
            label="Subtitle"
            value={course.subtitle ?? ""}
            onChange={(event) => updateField("subtitle", event.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={course.status}
              onChange={(event) =>
                updateField("status", event.target.value as CourseStatus)
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          rows={5}
          value={course.description}
          onChange={(event) => updateField("description", event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <Button variant="secondary" onClick={handleCreateLesson} disabled={isPending}>
            Add Lesson
          </Button>
          <Button onClick={handleSaveCourse} disabled={isPending}>
            {isPending ? "Saving..." : "Save Course"}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Lessons</h2>
            <p className="text-sm text-gray-500">
              Each lesson opens in the detailed constructor for HTML, assets, and homework.
            </p>
          </div>
          <p className="text-sm text-gray-400">{course.lessons.length} lessons</p>
        </div>

        <CourseLessonList course={course} editable />
      </section>
    </div>
  );
}
