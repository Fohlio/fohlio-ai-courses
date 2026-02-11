"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LESSONS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import type { AdminStudentSummary } from "@/lib/types";

export default function AdminDashboardPage() {
  const [students, setStudents] = useState<AdminStudentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress/all")
      .then((res) => res.json())
      .then((data) => setStudents(data.students ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const totalStudents = students.length;
  const averageCompletion =
    totalStudents > 0
      ? Math.round(
          students.reduce(
            (sum, s) => sum + s.progress.completionPercentage,
            0,
          ) / totalStudents,
        )
      : 0;
  const publishedLessons = LESSONS.filter((l) => l.isPublished).length;

  const recentStudents = [...students]
    .filter((s) => s.progress.lastActivityAt !== null)
    .sort((a, b) => {
      const aTime = new Date(a.progress.lastActivityAt!).getTime();
      const bTime = new Date(b.progress.lastActivityAt!).getTime();
      return bTime - aTime;
    })
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link
          href="/admin/students"
          className="text-sm font-medium text-brand hover:underline"
        >
          View All Students
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">Total Students</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totalStudents}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">
            Average Completion
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {averageCompletion}%
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">
            Published Lessons
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {publishedLessons}
            <span className="text-base font-normal text-gray-400">
              /{LESSONS.length}
            </span>
          </p>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Activity
        </h2>
        {recentStudents.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500">No recent activity.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Student
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Progress
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((student) => (
                  <tr
                    key={student.user.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/students/${student.user.githubNickname}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {student.user.githubNickname}
                      </Link>
                      {student.user.displayName && (
                        <span className="ml-2 text-gray-500">
                          ({student.user.displayName})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.progress.completionPercentage}%
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {student.progress.lastActivityAt
                        ? formatDate(new Date(student.progress.lastActivityAt))
                        : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
