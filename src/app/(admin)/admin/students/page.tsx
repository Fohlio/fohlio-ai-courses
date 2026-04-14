import Link from "next/link";
import { getAdminStudentSummaries } from "@/lib/courseQueries";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function AdminStudentsPage() {
  const students = await getAdminStudentSummaries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="mt-1 text-gray-500">
          Review overall progress across every published course.
        </p>
      </div>

      {students.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">No students registered yet.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="px-4 py-3 font-medium text-gray-600">Progress</th>
                <th className="px-4 py-3 font-medium text-gray-600">Courses</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.user.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/students/${student.user.githubNickname}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {student.user.githubNickname}
                    </Link>
                    {student.user.displayName && (
                      <span className="ml-2 text-gray-500">({student.user.displayName})</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-40">
                        <ProgressBar
                          value={student.progress.completionPercentage}
                          size="sm"
                          color={
                            student.progress.completionPercentage >= 80
                              ? "success"
                              : student.progress.completionPercentage > 0
                                ? "brand"
                                : "warning"
                          }
                        />
                      </div>
                      <span>{student.progress.completionPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {student.progress.courseProgress.length}
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
