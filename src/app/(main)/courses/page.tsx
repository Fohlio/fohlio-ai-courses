import { getCurrentUser } from "@/lib/auth";
import { getCourseCatalog } from "@/lib/courseQueries";
import { CourseCard } from "@/components/course/CourseCard";

export default async function CoursesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const courses = await getCourseCatalog({ id: user.id, role: user.role });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Course Catalog</h1>
        <p className="mt-1 text-gray-500">
          Browse published courses from different authors and continue where you left off.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          No published courses yet.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              href={`/courses/${course.slug}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
