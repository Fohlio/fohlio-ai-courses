"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import type { ChecklistContent } from "@/lib/types";

interface SubmissionChecklistProps {
  items: string[];
  value: ChecklistContent | null;
  onChange: (content: ChecklistContent) => void;
  disabled?: boolean;
}

export function SubmissionChecklist({
  items,
  value,
  onChange,
  disabled,
}: SubmissionChecklistProps) {
  function isChecked(index: number): boolean {
    return (
      value?.items?.find((i) => i.label === items[index])?.checked ?? false
    );
  }

  function toggle(index: number) {
    const newContent: ChecklistContent = {
      type: "checklist",
      items: items.map((label, i) => ({
        label,
        checked: i === index ? !isChecked(i) : isChecked(i),
      })),
    };
    onChange(newContent);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <Checkbox
          key={i}
          label={item}
          checked={isChecked(i)}
          onChange={() => toggle(i)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
