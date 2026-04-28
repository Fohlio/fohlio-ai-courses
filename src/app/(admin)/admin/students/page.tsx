import Link from "next/link";
import { getAdminStudentSummaries } from "@/lib/courseQueries";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const allStudents = await getAdminStudentSummaries();
  const { q } = await searchParams;
  const search = q?.trim().toLowerCase() ?? "";

  const students = search
    ? allStudents.filter((entry) => {
        const haystack = [
          entry.user.githubNickname,
          entry.user.displayName ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(search);
      })
    : allStudents;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="mt-1 text-gray-500">
          Review overall progress across every published course.
        </p>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by nickname or name…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Search
        </button>
        {search && (
          <Link
            href="/admin/students"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      <p className="text-xs text-gray-500">
        {students.length} of {allStudents.length} users
      </p>

      {students.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">
            {search
              ? `No users match "${search}".`
              : "No users registered yet."}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="px-4 py-3 font-medium text-gray-600">Progress</th>
                <th className="px-4 py-3 font-medium text-gray-600">Submissions</th>
                <th className="px-4 py-3 font-medium text-gray-600">Joined</th>
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
                      <span className="ml-2 text-gray-500">
                        ({student.user.displayName})
                      </span>
                    )}
                    {student.user.role === "admin" && (
                      <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        admin
                      </span>
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
                    {student.progress.completedTasks}/{student.progress.totalTasks}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {student.user.createdAt
                      ? dateFormatter.format(new Date(student.user.createdAt))
                      : "—"}
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
