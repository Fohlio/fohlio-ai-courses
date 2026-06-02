import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getOverallProgress,
  getResumeTarget,
  isResumeTarget,
} from "@/lib/progressTracking";
import { prisma } from "@/lib/prisma";
import { ResumeCard } from "@/components/course/ResumeCard";
import { CourseProgressRow } from "@/components/course/CourseProgressRow";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Progress",
  robots: { index: false, follow: false },
};

export default async function ProgressPage() {
  // Auth is also enforced by middleware, but we defend in depth.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/progress");
  }

  const [overall, resumeTarget] = await Promise.all([
    getOverallProgress(user.id),
    getResumeTarget(user.id),
  ]);

  const { courses } = overall;

  // Fetch course metadata (title, slug) for all started courses in one query.
  // The progress lib only returns courseIds; we need titles/slugs for display.
  const courseIds = courses.map((c) => c.courseId);
  const courseMeta =
    courseIds.length > 0
      ? await prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true, title: true, slug: true },
        })
      : [];
  const metaById = new Map(courseMeta.map((c) => [c.id, c]));

  const coursesStarted = courses.length;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1
          className="text-3xl font-bold text-gray-900"
          data-testid="progress-page-heading"
        >
          Progress
        </h1>
        <p className="text-sm text-gray-500">
          Track progress across every published course you are taking.
        </p>
      </header>

      {/* === OVERALL SUMMARY === */}
      {coursesStarted > 0 ? (
        <section
          className="space-y-5 rounded-2xl border border-gray-200 bg-gray-50 p-6"
          data-testid="progress-overall-section"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Overall</h2>
            <span className="text-sm text-gray-500">
              {coursesStarted} course{coursesStarted === 1 ? "" : "s"} started
            </span>
          </div>

          {/* Homework% — HEADLINE metric (same number as catalog card + header) */}
          <div className="space-y-1.5" data-testid="progress-overall-homework">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900">Homework</span>
                <span className="ml-2 text-sm text-gray-500">
                  {overall.homeworkPercent}%
                </span>
              </div>
            </div>
            <ProgressBar
              value={overall.homeworkPercent}
              color="success"
              aria-label={`Overall homework ${overall.homeworkPercent}% complete`}
            />
            <p className="text-xs text-gray-500">
              Lessons where you have submitted every required task.
            </p>
          </div>

          {/* Read% — secondary metric */}
          <div className="space-y-1.5" data-testid="progress-overall-read">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900">Read</span>
                <span className="ml-2 text-sm text-gray-500">
                  {overall.readPercent}%
                </span>
              </div>
            </div>
            <ProgressBar
              value={overall.readPercent}
              color="warning"
              size="sm"
              aria-label={`Overall read ${overall.readPercent}%`}
            />
            <p className="text-xs text-gray-500">
              Lessons you have scrolled through to the end.
            </p>
          </div>
        </section>
      ) : null}

      {/* === RESUME / ALL-CAUGHT-UP === */}
      {isResumeTarget(resumeTarget) ? (
        <ResumeCard target={resumeTarget} showCourseTitle />
      ) : resumeTarget?.allCaughtUp ? (
        <div
          className="space-y-3 rounded-2xl border border-success/30 bg-success-light p-6 text-center"
          data-testid="progress-all-caught-up"
        >
          <p className="font-semibold text-gray-900">All caught up</p>
          <p className="text-sm text-gray-500">
            You have completed every published lesson. Nice work.
          </p>
          <Link href="/courses">
            <Button variant="primary" size="sm">
              Browse courses
            </Button>
          </Link>
        </div>
      ) : null}

      {/* === PER-COURSE BREAKDOWN === */}
      {coursesStarted > 0 ? (
        <section className="space-y-4" data-testid="progress-courses-section">
          <h2 className="font-semibold text-gray-900">By course</h2>
          {courses.map((courseProgress) => {
            const meta = metaById.get(courseProgress.courseId);
            if (!meta) return null;
            return (
              <CourseProgressRow
                key={courseProgress.courseId}
                progress={courseProgress}
                courseTitle={meta.title}
                courseSlug={meta.slug}
              />
            );
          })}
        </section>
      ) : (
        /* === EMPTY STATE === */
        <div
          className="space-y-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center"
          data-testid="progress-empty-state"
        >
          <div className="space-y-2">
            <p className="font-semibold text-gray-900">No progress yet</p>
            <p className="text-sm text-gray-500">
              Open a lesson to start tracking your progress here.
            </p>
          </div>
          <Link href="/courses">
            <Button variant="primary">Browse courses</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
