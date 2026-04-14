import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOwnerCourseDashboard } from "@/lib/courseQueries";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function AdminCourseDetailPage({
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
      <div>
        <Link href="/admin/courses" className="text-sm font-medium text-brand hover:underline">
          &larr; Back to courses
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {dashboard.course.title}
        </h1>
        <p className="mt-1 text-gray-500">
          Owner: {dashboard.course.owner.githubNickname}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">Learners</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{dashboard.totalStudents}</p>
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

      <section className="grid gap-4 lg:grid-cols-2">
        {dashboard.students.map((student) => (
          <Card key={student.user.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">{student.user.githubNickname}</p>
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
      </section>
    </div>
  );
}
