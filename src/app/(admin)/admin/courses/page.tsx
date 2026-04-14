import Link from "next/link";
import { getAdminCourseSummaries } from "@/lib/courseQueries";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await getAdminCourseSummaries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="mt-1 text-gray-500">
          Monitor all published, draft, and archived courses across the platform.
        </p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">No courses available.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((summary) => (
            <Link key={summary.course.id} href={`/admin/courses/${summary.course.id}`}>
              <Card className="transition-colors hover:border-brand/30">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{summary.course.title}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {summary.course.owner.githubNickname} • {summary.course.status}
                    </p>
                  </div>
                  <div className="min-w-44">
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                      <span>{summary.studentsCompleted}/{summary.totalStudents} complete</span>
                      <span>{summary.averageCompletion}%</span>
                    </div>
                    <ProgressBar
                      value={summary.averageCompletion}
                      size="sm"
                      color={
                        summary.averageCompletion >= 80
                          ? "success"
                          : summary.averageCompletion > 0
                            ? "brand"
                            : "warning"
                      }
                    />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
