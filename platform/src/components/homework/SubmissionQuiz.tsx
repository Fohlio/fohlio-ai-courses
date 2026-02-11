"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface SubmissionQuizProps {
  taskId: string;
  questions: string[];
}

export function SubmissionQuiz({ taskId: _taskId, questions }: SubmissionQuizProps) {
  const [answers, setAnswers] = useState<string[]>(
    new Array(questions.length).fill(""),
  );

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {questions.map((question, i) => (
        <div key={i}>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {question}
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            rows={2}
            value={answers[i]}
            onChange={(e) => updateAnswer(i, e.target.value)}
            placeholder="Your answer..."
          />
        </div>
      ))}
      <Button variant="primary" size="sm">
        Save All Answers
      </Button>
    </div>
  );
}
