import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;
  const body = await request.json();
  const { lessonId, content, completed } = body;

  if (!content?.type || !lessonId) {
    return NextResponse.json(
      { error: "lessonId and content are required" },
      { status: 400 },
    );
  }

  const status = completed ? "submitted" : "submitted";

  const submission = await prisma.taskSubmission.upsert({
    where: { userId_taskId: { userId: user.id, taskId } },
    create: {
      userId: user.id,
      taskId,
      lessonId,
      status,
      content,
    },
    update: {
      status,
      content,
    },
  });

  return NextResponse.json({ submission });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  const submission = await prisma.taskSubmission.findUnique({
    where: { userId_taskId: { userId: user.id, taskId } },
  });

  return NextResponse.json({ submission: submission ?? null });
}
