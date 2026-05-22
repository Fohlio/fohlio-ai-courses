import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSeriesBySlug } from "@/lib/courseQueries";
import { CourseCard } from "@/components/course/CourseCard";

export const dynamic = "force-dynamic";

interface SeriesDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { slug } = await params;
  const series = await getSeriesBySlug(slug, { id: user.id, role: user.role });

  if (!series) {
    notFound();
  }

  const totalCompletion =
    series.courses.length === 0
      ? 0
      : Math.round(
          series.courses.reduce(
            (sum, course) => sum + (course.progress?.completionPercentage ?? 0),
            0,
          ) / series.courses.length,
        );

  return (
    <div className="space-y-8">
      <nav className="text-sm text-gray-500">
        <Link href="/series" className="hover:text-gray-700">
          ← All tracks
        </Link>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">{series.title}</h1>
        {series.subtitle && (
          <p className="text-lg text-gray-500">{series.subtitle}</p>
        )}
        <p className="max-w-3xl text-gray-700">{series.description}</p>

        <dl className="flex flex-wrap gap-x-8 gap-y-2 pt-2 text-sm text-gray-500">
          <div className="flex gap-2">
            <dt className="font-medium text-gray-700">Courses</dt>
            <dd>{series.courseCount}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-gray-700">Published lessons</dt>
            <dd>{series.publishedLessonCount}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-gray-700">Homework tasks</dt>
            <dd>{series.totalTasks}</dd>
          </div>
          {series.courseCount > 0 && (
            <div className="flex gap-2">
              <dt className="font-medium text-gray-700">Average progress</dt>
              <dd>{totalCompletion}%</dd>
            </div>
          )}
        </dl>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Courses in this track
        </h2>

        {series.courses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
            No published courses in this track yet.
          </div>
        ) : (
          <ol className="grid gap-6 lg:grid-cols-2">
            {series.courses.map((course, index) => (
              <li key={course.id} className="relative">
                <div className="absolute -left-3 -top-3 z-10 hidden h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white shadow md:flex">
                  {index + 1}
                </div>
                <CourseCard
                  course={course}
                  href={`/courses/${course.slug}`}
                />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
