"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { AdminStudentSummary } from "@/lib/types";

export default function AdminStudentsPage() {
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
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Students</h1>

      {students.length === 0 ? (
        <p className="text-gray-500">No students registered yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
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
              {students.map((student) => (
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
  );
}
