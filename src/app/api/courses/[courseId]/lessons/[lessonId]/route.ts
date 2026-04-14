import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteLesson, updateLesson } from "@/lib/courseMutations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId, lessonId } = await params;
  const payload = await request.json();
  const result = await updateLesson(
    { id: user.id, role: user.role },
    courseId,
    lessonId,
    payload,
  );

  if (!result.ok) {
    const status = result.error === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  const lesson = result.data.lessons.find((item) => item.id === lessonId) ?? null;
  return NextResponse.json({ data: lesson });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId, lessonId } = await params;
  const result = await deleteLesson(
    { id: user.id, role: user.role },
    courseId,
    lessonId,
  );

  if (!result.ok) {
    const status = result.error === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ data: result.data });
}
