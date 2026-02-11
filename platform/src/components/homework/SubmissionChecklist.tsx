"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";

interface SubmissionChecklistProps {
  taskId: string;
  items: string[];
}

export function SubmissionChecklist({ taskId: _taskId, items }: SubmissionChecklistProps) {
  const [checked, setChecked] = useState<boolean[]>(
    new Array(items.length).fill(false),
  );

  function toggle(index: number) {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <Checkbox
          key={i}
          label={item}
          checked={checked[i]}
          onChange={() => toggle(i)}
        />
      ))}
    </div>
  );
}
