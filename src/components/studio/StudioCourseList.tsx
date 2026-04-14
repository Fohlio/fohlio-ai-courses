"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { CourseCard } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CourseCard as CourseCardView } from "@/components/course/CourseCard";

interface StudioCourseListProps {
  initialCourses: CourseCard[];
}

export function StudioCourseList({ initialCourses }: StudioCourseListProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setTitle("");
    setSubtitle("");
    setDescription("");
  }

  function handleCreateCourse() {
    startTransition(async () => {
      setError(null);

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subtitle, description }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create course.");
        return;
      }

      setCourses((currentCourses) => [data.data, ...currentCourses]);
      resetForm();
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Create a course</h2>
          <p className="mt-1 text-sm text-gray-500">
            Courses start as drafts. You can add lessons, homework, and media before publishing.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Platform Onboarding"
          />
          <Input
            label="Subtitle"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            placeholder="Optional short hook"
          />
        </div>

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          placeholder="Describe what learners will get from this course."
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleCreateCourse}
            disabled={isPending || !title.trim() || description.trim().length < 10}
          >
            {isPending ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My courses</h2>
            <p className="text-sm text-gray-500">
              Open a course to manage lessons, publishing, and learner review.
            </p>
          </div>
          <p className="text-sm text-gray-400">{courses.length} total</p>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            No courses yet.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {courses.map((course) => (
              <Link key={course.id} href={`/studio/courses/${course.id}`}>
                <CourseCardView course={course} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
