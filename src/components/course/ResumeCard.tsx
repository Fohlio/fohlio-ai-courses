import Link from "next/link";
import type { ResumeTarget } from "@/lib/progressTracking";
import { Button } from "@/components/ui/Button";

interface ResumeCardProps {
  target: ResumeTarget;
  /**
   * When true, show the course title (catalog context, where the card may point
   * at a different course than the one being viewed). On a course page where the
   * target IS the current course, the lesson line alone is enough.
   */
  showCourseTitle?: boolean;
}

/**
 * "Continue where you left off" affordance — links to the next incomplete
 * lesson from getResumeTarget. No streak / loss framing; this is a
 * continue-learning affordance, not a points display.
 *
 * Server component — rendered only when a resume target is present.
 */
export function ResumeCard({ target, showCourseTitle = false }: ResumeCardProps) {
  const href = `/courses/${target.courseSlug}/lessons/${target.lessonSlug}`;

  return (
    <Link
      href={href}
      data-testid="resume-card"
      className="block rounded-2xl border border-brand/30 bg-brand-light/40 p-5 transition-colors hover:bg-brand-light/60"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Continue where you left off
          </p>
          {showCourseTitle && (
            <p className="truncate text-sm text-gray-500">{target.courseTitle}</p>
          )}
          <p className="truncate font-semibold text-gray-900">
            {target.lessonTitle}
          </p>
        </div>
        <span className="shrink-0">
          <Button variant="primary" size="sm" tabIndex={-1}>
            Continue
          </Button>
        </span>
      </div>
    </Link>
  );
}
