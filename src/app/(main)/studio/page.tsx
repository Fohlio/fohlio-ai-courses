import { getCurrentUser } from "@/lib/auth";
import { getStudioCourses } from "@/lib/courseQueries";
import { StudioCourseList } from "@/components/studio/StudioCourseList";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const courses = await getStudioCourses({ id: user.id, role: user.role });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Studio</h1>
        <p className="mt-1 text-gray-500">
          Create courses, edit lesson HTML, upload media, and manage homework.
        </p>
      </div>

      <StudioCourseList initialCourses={courses} />
    </div>
  );
}
