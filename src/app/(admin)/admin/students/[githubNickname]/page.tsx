import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminStudentSummaries } from "@/lib/courseQueries";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ githubNickname: string }>;
}) {
  const { githubNickname } = await params;
  const students = await getAdminStudentSummaries();
  const student = students.find((item) => item.user.githubNickname === githubNickname);

  if (!student) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/students" className="text-sm font-medium text-brand hover:underline">
          &larr; Back to students
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {student.user.githubNickname}
        </h1>
        {student.user.displayName && (
          <p className="mt-1 text-gray-500">{student.user.displayName}</p>
        )}
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Overall completion</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {student.progress.completionPercentage}%
            </p>
          </div>
          <div className="w-56">
            <ProgressBar
              value={student.progress.completionPercentage}
              color={
                student.progress.completionPercentage >= 80
                  ? "success"
                  : student.progress.completionPercentage > 0
                    ? "brand"
                    : "warning"
              }
            />
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Courses</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {student.progress.courseProgress.map((course) => (
            <Card key={course.courseId}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{course.courseTitle}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {course.completedLessons}/{course.totalLessons} lessons complete
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {course.completionPercentage}%
                </span>
              </div>
              <div className="mt-3">
                <ProgressBar
                  value={course.completionPercentage}
                  size="sm"
                  color={
                    course.completionPercentage >= 80
                      ? "success"
                      : course.completionPercentage > 0
                        ? "brand"
                        : "warning"
                  }
                />
              </div>
              <div className="mt-4 space-y-2">
                {course.lessonProgress.map((lesson) => (
                  <div
                    key={lesson.lessonId}
                    className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600"
                  >
                    Lesson {lesson.lessonNumber}: {lesson.lessonTitle} • {lesson.completedTasks}/
                    {lesson.totalTasks} tasks
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
