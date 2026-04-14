import Link from "next/link";
import { getAdminCourseSummaries, getAdminStudentSummaries } from "@/lib/courseQueries";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [courses, students] = await Promise.all([
    getAdminCourseSummaries(),
    getAdminStudentSummaries(),
  ]);

  const averageCompletion =
    students.length > 0
      ? Math.round(
          students.reduce(
            (sum, student) => sum + student.progress.completionPercentage,
            0,
          ) / students.length,
        )
      : 0;
  const recentStudents = [...students]
    .filter((student) =>
      student.progress.courseProgress.some((course) => course.lastActivityAt),
    )
    .sort((left, right) => {
      const leftTime = Math.max(
        ...left.progress.courseProgress.map((course) =>
          course.lastActivityAt ? new Date(course.lastActivityAt).getTime() : 0,
        ),
      );
      const rightTime = Math.max(
        ...right.progress.courseProgress.map((course) =>
          course.lastActivityAt ? new Date(course.lastActivityAt).getTime() : 0,
        ),
      );
      return rightTime - leftTime;
    })
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Global visibility across authors, courses, and learners.
          </p>
        </div>
        <Link href="/admin/courses" className="text-sm font-medium text-brand hover:underline">
          Review all courses
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">Published courses</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {courses.filter((course) => course.course.status === "published").length}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Students</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{students.length}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Average completion</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{averageCompletion}%</p>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Course health</h2>
          <Link href="/admin/courses" className="text-sm font-medium text-brand hover:underline">
            Open course list
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {courses.slice(0, 4).map((summary) => (
            <Card key={summary.course.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/admin/courses/${summary.course.id}`}
                    className="font-semibold text-gray-900 hover:text-brand"
                  >
                    {summary.course.title}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    {summary.course.owner.githubNickname}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{summary.averageCompletion}% average</p>
                  <p>{summary.studentsCompleted}/{summary.totalStudents} complete</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent learner activity</h2>
        {recentStudents.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-500">No learner activity yet.</p>
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
                {recentStudents.map((student) => (
                  <tr key={student.user.id} className="border-b border-gray-100">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/students/${student.user.githubNickname}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {student.user.githubNickname}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{student.progress.completionPercentage}%</td>
                    <td className="px-4 py-3 text-gray-500">
                      {student.progress.courseProgress.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
