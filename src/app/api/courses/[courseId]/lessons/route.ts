import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createLesson } from "@/lib/courseMutations";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await params;
  const result = await createLesson({ id: user.id, role: user.role }, courseId);

  if (!result.ok) {
    const status = result.error === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  const lesson = result.data.lessons[result.data.lessons.length - 1] ?? null;
  return NextResponse.json({ data: lesson }, { status: 201 });
}
