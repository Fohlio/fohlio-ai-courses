/**
 * Three-state lesson status indicator.
 *
 * States are distinguished by SHAPE + accessible LABEL, not color alone:
 *   completed   — filled green circle with a ✓ checkmark ("Completed")
 *   read        — dashed amber/warning circle with a dot inside ("Read")
 *   not-started — empty bordered circle ("Not started")
 *
 * `completed` supersedes `read`: a lesson that is both read and completed shows
 * the completed state. The `read` state only renders when read AND not completed.
 */
interface LessonStatusIconProps {
  completed: boolean;
  read: boolean;
  lessonId: string;
}

export function LessonStatusIcon({
  completed,
  read,
  lessonId,
}: LessonStatusIconProps) {
  if (completed) {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-xs text-white"
        aria-label="Completed"
        data-testid={`lesson-status-completed-${lessonId}`}
      >
        ✓
      </span>
    );
  }

  if (read) {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-warning"
        aria-label="Read"
        data-testid={`lesson-status-read-${lessonId}`}
      >
        {/* Small dot to further distinguish the shape from the empty circle. */}
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
      </span>
    );
  }

  return (
    <span
      className="block h-5 w-5 shrink-0 rounded-full border-2 border-gray-300"
      aria-label="Not started"
      data-testid={`lesson-status-not-started-${lessonId}`}
    />
  );
}
