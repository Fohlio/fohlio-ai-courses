interface LessonGoalsProps {
  goals: string[];
}

function LessonGoals({ goals }: LessonGoalsProps) {
  if (goals.length === 0) return null;

  return (
    <div
      className="rounded-lg border-l-4 border-brand bg-brand-light/30 p-5"
      data-testid="lesson-goals"
    >
      <h2 className="mb-2 text-lg font-semibold text-foreground">
        Learning Goals
      </h2>
      <p className="mb-3 text-sm text-gray-600">
        By the end of this lesson you will:
      </p>
      <ul className="flex flex-col gap-2" data-testid="lesson-goals-list">
        {goals.map((goal, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" />
            {goal}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { LessonGoals };
export type { LessonGoalsProps };
