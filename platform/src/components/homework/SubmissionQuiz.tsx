"use client";

import type { QuizContent } from "@/lib/types";

interface SubmissionQuizProps {
  questions: string[];
  value: QuizContent | null;
  onChange: (content: QuizContent) => void;
  disabled?: boolean;
}

export function SubmissionQuiz({
  questions,
  value,
  onChange,
  disabled,
}: SubmissionQuizProps) {
  function getAnswer(index: number): string {
    return value?.answers?.find((a) => a.questionIndex === index)?.answer ?? "";
  }

  function updateAnswer(index: number, answer: string) {
    const newContent: QuizContent = {
      type: "quiz",
      answers: questions.map((question, i) => ({
        questionIndex: i,
        question,
        answer: i === index ? answer : getAnswer(i),
      })),
    };
    onChange(newContent);
  }

  return (
    <div className="space-y-4">
      {questions.map((question, i) => (
        <div key={i}>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {question}
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-gray-50 disabled:text-gray-500"
            rows={2}
            value={getAnswer(i)}
            onChange={(e) => updateAnswer(i, e.target.value)}
            placeholder="Your answer..."
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}
