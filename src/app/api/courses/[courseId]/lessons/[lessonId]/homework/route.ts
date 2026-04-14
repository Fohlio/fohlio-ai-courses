import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { replaceLessonHomework } from "@/lib/courseMutations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId, lessonId } = await params;
  const payload = await request.json();
  const result = await replaceLessonHomework(
    { id: user.id, role: user.role },
    courseId,
    lessonId,
    payload,
  );

  if (!result.ok) {
    const status = result.error === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  const lesson = result.data.lessons.find((item) => item.id === lessonId);
  return NextResponse.json({ data: lesson?.homework.flatMap((section) => section.tasks) ?? [] });
}
