import { LESSONS } from "@/lib/constants";
import { LessonCard } from "@/components/lesson/LessonCard";

export default function LessonsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
        <p className="mt-1 text-gray-500">
          Track your progress through the Fohlio Tech Course
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {LESSONS.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}
