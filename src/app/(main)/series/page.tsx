import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSeriesCatalog } from "@/lib/courseQueries";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function SeriesIndexPage() {
  const user = await getCurrentUser();
  // Belt-and-braces: middleware already protects this route, but if it is
  // ever bypassed (e.g. in unit tests) we still send unauth users to login.
  if (!user) redirect("/login?redirect=/series");

  const series = await getSeriesCatalog();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tracks</h1>
        <p className="mt-1 text-gray-500">
          Tracks bundle related courses into a single learning path.
        </p>
      </div>

      {series.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          No tracks yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {series.map((entry) => (
            <Link
              key={entry.id}
              href={`/series/${entry.slug}`}
              data-testid={`series-card-${entry.slug}`}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-2xl"
            >
              <Card className="flex h-full flex-col gap-4 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="success">Track</Badge>
                  <span className="text-xs text-gray-400">
                    {entry.courseCount} course
                    {entry.courseCount === 1 ? "" : "s"}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {entry.title}
                  </h2>
                  {entry.subtitle && (
                    <p className="mt-1 text-sm text-gray-500">
                      {entry.subtitle}
                    </p>
                  )}
                </div>

                <p className="line-clamp-3 text-sm text-gray-600">
                  {entry.description}
                </p>

                <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                  <span>{entry.publishedLessonCount} published lessons</span>
                  <span>{entry.totalTasks} homework tasks</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
