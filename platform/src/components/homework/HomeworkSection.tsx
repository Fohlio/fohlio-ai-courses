import type { HomeworkSection as HomeworkSectionType } from "@/lib/types";
import { TaskCard } from "./TaskCard";

interface HomeworkSectionProps {
  section: HomeworkSectionType;
}

export function HomeworkSection({ section }: HomeworkSectionProps) {
  const title =
    section.category === "required"
      ? "Required (for everyone)"
      : "Advanced (optional)";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="space-y-3">
        {section.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
