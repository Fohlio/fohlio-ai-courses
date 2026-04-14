import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOwnerCourseDashboard } from "@/lib/courseQueries";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const dynamic = "force-dynamic";

export default async function StudioCourseStudentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { courseId } = await params;
  const dashboard = await getOwnerCourseDashboard(courseId, {
    id: user.id,
    role: user.role,
  });

  if (!dashboard) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/studio/courses/${dashboard.course.id}`}
            className="text-sm font-medium text-brand hover:underline"
          >
            &larr; Back to course
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {dashboard.course.title} learner review
          </h1>
          <p className="mt-1 text-gray-500">
            Track completion and recent homework activity for this course.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">Students</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {dashboard.totalStudents}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Average completion</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {dashboard.averageCompletion}%
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Recent submissions</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {dashboard.recentSubmissions.length}
          </p>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Learners</h2>
        {dashboard.students.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-500">No learners have started this course yet.</p>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {dashboard.students.map((student) => (
              <Card key={student.user.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {student.user.githubNickname}
                    </p>
                    {student.user.displayName && (
                      <p className="text-sm text-gray-500">{student.user.displayName}</p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-500">
                    {student.progress.completionPercentage}%
                  </span>
                </div>
                <div className="mt-3">
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
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent submissions</h2>
        {dashboard.recentSubmissions.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-500">No homework submissions yet.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-600">Learner</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Lesson</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Task</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentSubmissions.map((submission) => (
                  <tr key={submission.submissionId} className="border-b border-gray-100">
                    <td className="px-4 py-3">{submission.user.githubNickname}</td>
                    <td className="px-4 py-3">{submission.lessonTitle}</td>
                    <td className="px-4 py-3">{submission.taskTitle}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(submission.submittedAt))}
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
