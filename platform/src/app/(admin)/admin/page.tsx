"use client";

import Link from "next/link";
import { LESSONS } from "@/lib/constants";
import { MOCK_STUDENTS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export default function AdminDashboardPage() {
  const totalStudents = MOCK_STUDENTS.length;
  const averageCompletion = Math.round(
    MOCK_STUDENTS.reduce((sum, s) => sum + s.progress.completionPercentage, 0) /
      totalStudents
  );
  const publishedLessons = LESSONS.filter((l) => l.isPublished).length;

  // Sort students by last activity descending for recent activity section
  const recentStudents = [...MOCK_STUDENTS]
    .filter((s) => s.progress.lastActivityAt !== null)
    .sort((a, b) => {
      const aTime = a.progress.lastActivityAt?.getTime() ?? 0;
      const bTime = b.progress.lastActivityAt?.getTime() ?? 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12" data-testid="admin-dashboard-page">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link
          href="/admin/students"
          className="text-sm font-medium text-brand hover:underline"
          data-testid="admin-view-all-students-link"
        >
          View All Students
        </Link>
      </div>

      {/* Top stats row */}
      <div
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        data-testid="admin-stats"
      >
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

      {/* Recent Activity */}
      <div data-testid="admin-recent-activity">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Activity
        </h2>
        {recentStudents.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500">No recent activity.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table
              className="w-full text-left text-sm"
              data-testid="admin-recent-activity-table"
            >
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
                        data-testid={`admin-recent-student-${student.user.githubNickname}`}
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
                        ? formatDate(student.progress.lastActivityAt)
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
