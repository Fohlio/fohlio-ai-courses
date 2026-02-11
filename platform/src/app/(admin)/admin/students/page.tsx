"use client";

import Link from "next/link";
import { MOCK_STUDENTS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function AdminStudentsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12" data-testid="admin-students-page">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Students</h1>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table
          className="w-full text-left text-sm"
          data-testid="admin-students-table"
        >
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 font-medium text-gray-600">
                GitHub Nickname
              </th>
              <th className="px-4 py-3 font-medium text-gray-600">
                Display Name
              </th>
              <th className="min-w-[160px] px-4 py-3 font-medium text-gray-600">
                Progress
              </th>
              <th className="px-4 py-3 font-medium text-gray-600">
                Last Activity
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_STUDENTS.map((student) => (
              <tr
                key={student.user.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                data-testid={`admin-student-row-${student.user.githubNickname}`}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/students/${student.user.githubNickname}`}
                    className="font-medium text-brand hover:underline"
                    data-testid={`admin-student-link-${student.user.githubNickname}`}
                  >
                    {student.user.githubNickname}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {student.user.displayName ?? "--"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProgressBar
                      value={student.progress.completionPercentage}
                      size="sm"
                      color={
                        student.progress.completionPercentage >= 80
                          ? "success"
                          : student.progress.completionPercentage >= 40
                            ? "brand"
                            : "warning"
                      }
                      className="flex-1"
                    />
                    <span className="w-10 text-right text-xs font-medium text-gray-600">
                      {student.progress.completionPercentage}%
                    </span>
                  </div>
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
    </div>
  );
}
